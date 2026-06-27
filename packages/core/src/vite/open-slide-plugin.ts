import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as babelParse } from '@babel/parser';
import * as t from '@babel/types';
import fg from 'fast-glob';
import { loadConfigFromFile, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import type { OpenSlideConfig } from '../config.ts';

export type { OpenSlideConfig };

export type OpenSlidePluginOptions = {
  userCwd: string;
  config: OpenSlideConfig;
  coreVersion: string;
};

const CONFIG_FILE = 'open-slide.config.ts';

const SLIDES_VMOD = 'virtual:open-slide/slides';
const CONFIG_VMOD = 'virtual:open-slide/config';
const FOLDERS_VMOD = 'virtual:open-slide/folders';
const ASSETS_VMOD = 'virtual:open-slide/assets';
const IMAGE_EXTS = new Set([
  '.avif',
  '.bmp',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
]);
const SOURCE_EXTS = ['.tsx', '.jsx', '.ts', '.js'];

type FoldersManifest = {
  folders: unknown[];
  assignments: Record<string, string>;
};

async function readFoldersManifest(file: string): Promise<FoldersManifest> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Partial<FoldersManifest>;
    return {
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
      assignments:
        parsed.assignments && typeof parsed.assignments === 'object'
          ? (parsed.assignments as Record<string, string>)
          : {},
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { folders: [], assignments: {} };
    }
    throw err;
  }
}

function resolved(id: string): string {
  return `\0${id}`;
}

async function findSlides(userCwd: string, slidesDir: string): Promise<string[]> {
  const abs = path.resolve(userCwd, slidesDir);
  if (!existsSync(abs)) return [];
  const hits = await fg('*/index.{tsx,jsx,ts,js}', {
    cwd: abs,
    absolute: true,
    onlyFiles: true,
  });
  return hits.sort();
}

function isImageAsset(file: string): boolean {
  const clean = file.split(/[?#]/, 1)[0] ?? file;
  return IMAGE_EXTS.has(path.extname(clean).toLowerCase());
}

function resolveLocalSourceImport(from: string, spec: string, slideDir: string): string | null {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  if (base !== slideDir && !base.startsWith(slideDir + path.sep)) return null;

  const ext = path.extname(base);
  const candidates = SOURCE_EXTS.includes(ext)
    ? [base]
    : [
        ...SOURCE_EXTS.map((sourceExt) => `${base}${sourceExt}`),
        ...SOURCE_EXTS.map((sourceExt) => path.join(base, `index${sourceExt}`)),
      ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function toId(absFile: string, slidesRoot: string): string {
  const rel = path.relative(slidesRoot, absFile);
  return rel.split(path.sep)[0];
}

const META_THEME_RE = /(?:^|[\s,{])theme\s*:\s*['"]([^'"]+)['"]/;
const META_CREATED_AT_RE = /(?:^|[\s,{])createdAt\s*:\s*['"]([^'"]+)['"]/;

type ExtractedMeta = { theme: string | null; createdAt: string | null };

function extractMeta(src: string): ExtractedMeta {
  const empty: ExtractedMeta = { theme: null, createdAt: null };
  const metaStart = src.search(/export\s+const\s+meta\b/);
  if (metaStart === -1) return empty;
  const eqIdx = src.indexOf('=', metaStart);
  if (eqIdx === -1) return empty;
  const openBrace = src.indexOf('{', eqIdx);
  if (openBrace === -1) return empty;
  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }
  if (closeBrace === -1) return empty;
  const body = src.slice(openBrace + 1, closeBrace);
  const themeMatch = body.match(META_THEME_RE);
  const createdAtMatch = body.match(META_CREATED_AT_RE);
  return {
    theme: themeMatch ? themeMatch[1] : null,
    createdAt: createdAtMatch ? createdAtMatch[1] : null,
  };
}

async function readSlideMeta(abs: string): Promise<ExtractedMeta> {
  try {
    const src = await fs.readFile(abs, 'utf8');
    return extractMeta(src);
  } catch {
    return { theme: null, createdAt: null };
  }
}

async function readImportedImageAssets(
  abs: string,
  slidesRoot: string,
  assetsRoot: string,
): Promise<string[]> {
  const slideId = toId(abs, slidesRoot);
  const slideDir = path.join(slidesRoot, slideId);
  const slideAssetsRoot = path.join(slidesRoot, slideId, 'assets');
  const imported = new Set<string>();
  const seen = new Set<string>();

  async function visit(filePath: string) {
    if (seen.has(filePath)) return;
    seen.add(filePath);

    let ast: t.File;
    try {
      const src = await fs.readFile(filePath, 'utf8');
      ast = babelParse(src, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        errorRecovery: true,
      });
    } catch {
      return;
    }

    const localImports: string[] = [];
    for (const stmt of ast.program.body) {
      if (!t.isImportDeclaration(stmt)) continue;
      const raw = stmt.source.value;
      const clean = raw.split(/[?#]/, 1)[0] ?? raw;
      if (isImageAsset(clean)) {
        let asset: string | null = null;
        if (clean.startsWith('@assets/')) {
          asset = path.resolve(assetsRoot, clean.slice('@assets/'.length));
          if (!asset.startsWith(assetsRoot + path.sep)) asset = null;
        } else if (clean.startsWith('.')) {
          asset = path.resolve(path.dirname(filePath), clean);
          if (!asset.startsWith(slideAssetsRoot + path.sep)) asset = null;
        }
        if (asset) imported.add(asset);
        continue;
      }

      const next = resolveLocalSourceImport(filePath, clean, slideDir);
      if (next) localImports.push(next);
    }

    await Promise.all(localImports.map((next) => visit(next)));
  }

  await visit(abs);
  return Array.from(imported).sort();
}

function parseCreatedAtMs(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

async function generateSlidesModule(
  files: string[],
  slidesRoot: string,
  isDev: boolean,
): Promise<string> {
  const entries = await Promise.all(
    files.map(async (abs) => {
      const id = toId(abs, slidesRoot);
      const importPath = isDev ? `@fs/${normalizePath(abs).replace(/^\/+/, '')}` : abs;
      const meta = await readSlideMeta(abs);
      return { id, importPath, theme: meta.theme, createdAt: parseCreatedAtMs(meta.createdAt) };
    }),
  );

  const ids = JSON.stringify(entries.map((e) => e.id).sort());
  const themesMap: Record<string, string> = {};
  const createdAtMap: Record<string, number> = {};
  for (const e of entries) {
    if (e.theme) themesMap[e.id] = e.theme;
    if (e.createdAt !== null) createdAtMap[e.id] = e.createdAt;
  }
  const themesJson = JSON.stringify(themesMap);
  const createdAtJson = JSON.stringify(createdAtMap);
  const importTokens = JSON.stringify(Object.fromEntries(entries.map((e) => [e.id, 0])));
  const devRuntime = isDev
    ? `
const slideImportTokens = ${importTokens};
if (import.meta.hot) {
  import.meta.hot.on('open-slide:slide-changed', (data) => {
    const ids = Array.isArray(data?.slideIds) ? data.slideIds : data?.slideId ? [data.slideId] : [];
    const token = Date.now();
    for (const id of ids) {
      if (Object.prototype.hasOwnProperty.call(slideImportTokens, id)) slideImportTokens[id] = token;
    }
  });
}
`
    : '';
  const cases = entries
    .map((e) => {
      const importExpr = isDev
        ? `import(/* @vite-ignore */ import.meta.env.BASE_URL + ${JSON.stringify(`${e.importPath}?t=`)} + slideImportTokens[${JSON.stringify(e.id)}])`
        : `import(${JSON.stringify(e.importPath)})`;
      return `    case ${JSON.stringify(e.id)}: return ${importExpr};`;
    })
    .join('\n');

  return `// virtual:open-slide/slides — generated
export const slideIds = ${ids};
export const slideThemes = ${themesJson};
export const slideCreatedAt = ${createdAtJson};
${devRuntime}

export async function loadSlide(id) {
  switch (id) {
${cases}
    default: throw new Error('Slide not found: ' + id);
  }
}
`;
}

function toAssetImportPath(abs: string, isDev: boolean): string {
  const normalized = normalizePath(abs);
  const spec = isDev ? `/@fs/${normalized.replace(/^\/+/, '')}` : normalized;
  return `${spec}?url`;
}

async function generateAssetsModule(
  files: string[],
  slidesRoot: string,
  assetsRoot: string,
  isDev: boolean,
): Promise<string> {
  const entries = await Promise.all(
    files.map(async (abs) => ({
      id: toId(abs, slidesRoot),
      assets: await readImportedImageAssets(abs, slidesRoot, assetsRoot),
    })),
  );

  const assetIds = new Map<string, string>();
  for (const entry of entries) {
    for (const asset of entry.assets) {
      if (!assetIds.has(asset)) assetIds.set(asset, `asset${assetIds.size}`);
    }
  }

  const imports = Array.from(assetIds, ([asset, ident]) => {
    return `import ${ident} from ${JSON.stringify(toAssetImportPath(asset, isDev))};`;
  }).join('\n');
  const manifest = Object.fromEntries(
    entries
      .filter((entry) => entry.assets.length > 0)
      .map((entry) => [entry.id, entry.assets.map((asset) => assetIds.get(asset))]),
  );
  const manifestEntries = Object.entries(manifest)
    .map(([id, assets]) => `  ${JSON.stringify(id)}: [${assets.join(', ')}],`)
    .join('\n');

  return `${imports}

const imageAssets = {
${manifestEntries}
};

export async function loadSlideImageAssets(id) {
  return imageAssets[id] ?? [];
}
`;
}

export function openSlidePlugin(opts: OpenSlidePluginOptions): Plugin {
  const { userCwd, config, coreVersion } = opts;
  const slidesDir = config.slidesDir ?? 'slides';
  const assetsDir = config.assetsDir ?? 'assets';
  const slidesRoot = path.resolve(userCwd, slidesDir);
  const assetsRoot = path.resolve(userCwd, assetsDir);
  const foldersManifestPath = path.join(slidesRoot, '.folders.json');

  let isDev = false;
  const slideIdForEntry = (p: string): string | null => {
    const rel = path.relative(slidesRoot, p);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    const parts = rel.split(path.sep);
    if (parts.length !== 2) return null;
    if (!/^index\.(tsx|jsx|ts|js)$/.test(parts[1])) return null;
    return parts[0];
  };
  let slideChangeTimer: ReturnType<typeof setTimeout> | null = null;
  const pendingSlideChanges = new Set<string>();
  const queueSlideChanged = (server: ViteDevServer, id: string) => {
    pendingSlideChanges.add(id);
    if (slideChangeTimer) clearTimeout(slideChangeTimer);
    slideChangeTimer = setTimeout(() => {
      slideChangeTimer = null;
      for (const id of [SLIDES_VMOD, ASSETS_VMOD]) {
        const mod = server.moduleGraph.getModuleById(resolved(id));
        if (mod) server.moduleGraph.invalidateModule(mod);
      }
      const slideIds = Array.from(pendingSlideChanges);
      pendingSlideChanges.clear();
      server.ws.send({
        type: 'custom',
        event: 'open-slide:slide-changed',
        data: { slideIds },
      });
    }, 100);
  };

  return {
    name: 'open-slide',
    config(_c, env) {
      isDev = env.command === 'serve';
      return {
        server: { fs: { allow: [userCwd] } },
      };
    },
    resolveId(id) {
      if (id === SLIDES_VMOD) return resolved(SLIDES_VMOD);
      if (id === CONFIG_VMOD) return resolved(CONFIG_VMOD);
      if (id === FOLDERS_VMOD) return resolved(FOLDERS_VMOD);
      if (id === ASSETS_VMOD) return resolved(ASSETS_VMOD);
      return null;
    },
    async load(id) {
      if (id === resolved(SLIDES_VMOD)) {
        const files = await findSlides(userCwd, slidesDir);
        return await generateSlidesModule(files, slidesRoot, isDev);
      }
      if (id === resolved(CONFIG_VMOD)) {
        const userBuild = config.build ?? {};
        const buildResolved = isDev
          ? { showSlideBrowser: true, showSlideUi: true, allowHtmlDownload: true }
          : {
              showSlideBrowser: userBuild.showSlideBrowser ?? true,
              showSlideUi: userBuild.showSlideUi ?? true,
              allowHtmlDownload: userBuild.allowHtmlDownload ?? true,
            };
        const resolvedConfig = { ...config, build: buildResolved, version: coreVersion };
        return `export default ${JSON.stringify(resolvedConfig)};\n`;
      }
      if (id === resolved(FOLDERS_VMOD)) {
        const manifest = await readFoldersManifest(foldersManifestPath);
        return `export default ${JSON.stringify(manifest)};\n`;
      }
      if (id === resolved(ASSETS_VMOD)) {
        const files = await findSlides(userCwd, slidesDir);
        return await generateAssetsModule(files, slidesRoot, assetsRoot, isDev);
      }
      return null;
    },
    handleHotUpdate(ctx) {
      const slideId = slideIdForEntry(ctx.file);
      if (!slideId) return;
      queueSlideChanged(ctx.server, slideId);
      return [];
    },
    configureServer(server) {
      const isSlideEntry = (p: string) => slideIdForEntry(p) !== null;

      let reloadTimer: ReturnType<typeof setTimeout> | null = null;
      const reload = () => {
        if (reloadTimer) clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
          reloadTimer = null;
          const mod = server.moduleGraph.getModuleById(resolved(SLIDES_VMOD));
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }, 150);
      };
      // Vite's `root` is the core app dir, so chokidar doesn't watch the
      // user's slides folder by default. Add it explicitly — and pass the
      // directory itself, since Vite sets `disableGlobbing: true` and would
      // otherwise treat a glob pattern as a literal path.
      if (existsSync(slidesRoot)) server.watcher.add(slidesRoot);
      server.watcher.on('add', (p) => {
        if (isSlideEntry(p)) reload();
      });
      server.watcher.on('unlink', (p) => {
        if (isSlideEntry(p)) reload();
      });

      let foldersTimer: ReturnType<typeof setTimeout> | null = null;
      const invalidateFolders = () => {
        if (foldersTimer) clearTimeout(foldersTimer);
        foldersTimer = setTimeout(() => {
          foldersTimer = null;
          const mod = server.moduleGraph.getModuleById(resolved(FOLDERS_VMOD));
          if (mod) server.moduleGraph.invalidateModule(mod);
        }, 100);
      };
      server.watcher.add(foldersManifestPath);
      server.watcher.on('change', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
      server.watcher.on('add', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
      server.watcher.on('unlink', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
    },
  };
}

export async function loadUserConfig(userCwd: string): Promise<OpenSlideConfig> {
  const file = path.join(userCwd, CONFIG_FILE);
  if (!existsSync(file)) return {};
  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    file,
    userCwd,
    'silent',
  );
  return (loaded?.config ?? {}) as OpenSlideConfig;
}

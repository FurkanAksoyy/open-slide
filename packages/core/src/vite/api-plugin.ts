import fs from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect, Plugin, ViteDevServer } from 'vite';
import {
  b64urlEncode,
  findInsertion,
  markerDeleteRegex,
  newCommentId,
  offsetToLine,
  parseMarkers,
} from './comments.ts';
import { applyEdit, type EditOp } from './edit-ops.ts';
import { validateMutationRequest } from './request-guard.ts';
import { applyRevertAsset } from './revert-asset.ts';

const SLIDE_ID_RE = /^[a-z0-9_-]+$/i;

type AddCommentBody = {
  slideId?: string;
  line?: number;
  column?: number;
  text?: string;
  hint?: string;
};

type EditBody = {
  slideId?: string;
  line?: number;
  column?: number;
  ops?: EditOp[];
};

type EditBatchBody = {
  slideId?: string;
  edits?: Array<{ line?: number; column?: number; ops?: EditOp[] }>;
};

async function readBody(req: Connect.IncomingMessage): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

function resolveSlidePath(userCwd: string, slidesDir: string, slideId: string): string | null {
  if (!SLIDE_ID_RE.test(slideId)) return null;
  const slidesRoot = path.resolve(userCwd, slidesDir);
  const full = path.resolve(slidesRoot, slideId, 'index.tsx');
  if (!full.startsWith(slidesRoot + path.sep)) return null;
  return full;
}

export type ApiPluginOptions = {
  userCwd: string;
  slidesDir?: string;
};

export function apiPlugin(opts: ApiPluginOptions): Plugin {
  const userCwd = opts.userCwd;
  const slidesDir = opts.slidesDir ?? 'slides';

  return {
    name: 'open-slide:api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__edit', async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://local');
        const method = req.method ?? 'GET';
        if (method !== 'POST') return next();
        const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
        if (!requestCheck.ok) return json(res, requestCheck.status, { error: requestCheck.error });

        try {
          if (url.pathname === '/') {
            const body = (await readBody(req)) as EditBody;
            const slideId = body.slideId ?? '';
            const file = resolveSlidePath(userCwd, slidesDir, slideId);
            if (!file) return json(res, 400, { error: 'invalid slideId' });
            if (!body.line || body.line < 1) return json(res, 400, { error: 'invalid line' });
            if (!Array.isArray(body.ops)) return json(res, 400, { error: 'missing ops' });

            let source: string;
            try {
              source = await fs.readFile(file, 'utf8');
            } catch {
              return json(res, 404, { error: 'slide not found' });
            }

            const result = applyEdit(source, body.line, body.column ?? 0, body.ops);
            if (!result.ok) return json(res, result.status, { error: result.error });
            const changed = result.source !== source;
            if (changed) await fs.writeFile(file, result.source, 'utf8');
            return json(res, 200, { ok: true, changed });
          }

          if (url.pathname === '/revert-asset') {
            const body = (await readBody(req)) as { slideId?: string; assetPath?: string };
            const slideId = body.slideId ?? '';
            const assetPath = body.assetPath;
            const file = resolveSlidePath(userCwd, slidesDir, slideId);
            if (!file) return json(res, 400, { error: 'invalid slideId' });
            if (typeof assetPath !== 'string' || !assetPath) {
              return json(res, 400, { error: 'missing assetPath' });
            }
            if (!assetPath.startsWith('./assets/') && !assetPath.startsWith('@assets/')) {
              return json(res, 400, { error: 'asset path must start with ./assets/ or @assets/' });
            }

            let source: string;
            try {
              source = await fs.readFile(file, 'utf8');
            } catch {
              return json(res, 404, { error: 'slide not found' });
            }

            const result = applyRevertAsset(source, assetPath);
            if (!result.ok) return json(res, result.status, { error: result.error });
            const changed = result.source !== source;
            if (changed) await fs.writeFile(file, result.source, 'utf8');
            return json(res, 200, { ok: true, changed });
          }

          // One read-modify-write per batch so a multi-element edit
          // session lands as a single HMR. Per-edit failures are
          // reported but don't abort the batch.
          if (url.pathname === '/batch') {
            const body = (await readBody(req)) as EditBatchBody;
            const slideId = body.slideId ?? '';
            const file = resolveSlidePath(userCwd, slidesDir, slideId);
            if (!file) return json(res, 400, { error: 'invalid slideId' });
            if (!Array.isArray(body.edits)) return json(res, 400, { error: 'missing edits' });

            let source: string;
            try {
              source = await fs.readFile(file, 'utf8');
            } catch {
              return json(res, 404, { error: 'slide not found' });
            }

            const original = source;
            const results: Array<{ ok: boolean; error?: string }> = [];
            for (const edit of body.edits) {
              if (!edit.line || edit.line < 1 || !Array.isArray(edit.ops)) {
                results.push({ ok: false, error: 'invalid edit' });
                continue;
              }
              const r = applyEdit(source, edit.line, edit.column ?? 0, edit.ops);
              if (r.ok) {
                source = r.source;
                results.push({ ok: true });
              } else {
                results.push({ ok: false, error: r.error });
              }
            }
            const changed = source !== original;
            if (changed) await fs.writeFile(file, source, 'utf8');
            return json(res, 200, { ok: true, changed, results });
          }

          return next();
        } catch (err) {
          json(res, 500, { error: String((err as Error).message ?? err) });
        }
      });

      server.middlewares.use('/__comments', async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://local');
        const method = req.method ?? 'GET';

        try {
          if (method === 'GET' && url.pathname === '/') {
            const slideId = url.searchParams.get('slideId') ?? '';
            const file = resolveSlidePath(userCwd, slidesDir, slideId);
            if (!file) return json(res, 400, { error: 'invalid slideId' });
            let source: string;
            try {
              source = await fs.readFile(file, 'utf8');
            } catch {
              return json(res, 404, { error: 'slide not found' });
            }
            return json(res, 200, { comments: parseMarkers(source) });
          }

          if (method === 'POST' && url.pathname === '/add') {
            const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
            if (!requestCheck.ok) {
              return json(res, requestCheck.status, { error: requestCheck.error });
            }
            const body = (await readBody(req)) as AddCommentBody;
            const slideId = body.slideId ?? '';
            const file = resolveSlidePath(userCwd, slidesDir, slideId);
            if (!file) return json(res, 400, { error: 'invalid slideId' });
            if (!body.line || body.line < 1) return json(res, 400, { error: 'invalid line' });
            if (!body.text || typeof body.text !== 'string') {
              return json(res, 400, { error: 'missing text' });
            }

            let source: string;
            try {
              source = await fs.readFile(file, 'utf8');
            } catch {
              return json(res, 404, { error: 'slide not found' });
            }

            const plan = findInsertion(source, body.line, body.column);
            if (!plan) {
              return json(res, 422, {
                error:
                  'could not find a JSX container around line ' +
                  `${body.line}. Try clicking a different element.`,
              });
            }

            const id = newCommentId();
            const ts = new Date().toISOString();
            const payload = b64urlEncode(JSON.stringify({ note: body.text, hint: body.hint }));
            const marker = `\n${plan.indent}{/* @slide-comment id="${id}" ts="${ts}" text="${payload}" */}`;

            const next = source.slice(0, plan.offset) + marker + source.slice(plan.offset);
            await fs.writeFile(file, next, 'utf8');
            const markerLine = offsetToLine(next, plan.offset + 1);
            return json(res, 200, { id, line: markerLine });
          }

          if (method === 'DELETE' && url.pathname.startsWith('/')) {
            const requestCheck = validateMutationRequest(req);
            if (!requestCheck.ok) {
              return json(res, requestCheck.status, { error: requestCheck.error });
            }
            const id = url.pathname.slice(1);
            if (!/^c-[a-f0-9]+$/.test(id)) return json(res, 400, { error: 'invalid id' });
            const slideId = url.searchParams.get('slideId') ?? '';
            const file = resolveSlidePath(userCwd, slidesDir, slideId);
            if (!file) return json(res, 400, { error: 'invalid slideId' });

            let source: string;
            try {
              source = await fs.readFile(file, 'utf8');
            } catch {
              return json(res, 404, { error: 'slide not found' });
            }

            const lines = source.split('\n');
            const idRe = markerDeleteRegex(id);
            const hit = lines.findIndex((l) => idRe.test(l));
            if (hit === -1) return json(res, 404, { error: 'marker not found' });
            lines.splice(hit, 1);
            await fs.writeFile(file, lines.join('\n'), 'utf8');
            return json(res, 200, { ok: true });
          }

          next();
        } catch (err) {
          json(res, 500, { error: String((err as Error).message ?? err) });
        }
      });
    },
  };
}

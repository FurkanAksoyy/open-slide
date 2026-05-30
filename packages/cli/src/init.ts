import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { gitInitAndCommit } from './git.ts';
import type { PackageManager } from './package-manager.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(HERE, '..', 'template');
const IS_WINDOWS = process.platform === 'win32';

export type LocaleCode = 'en' | 'zh-TW' | 'zh-CN' | 'ja';

export const LOCALE_CHOICES: ReadonlyArray<{ title: string; value: LocaleCode }> = [
  { title: 'English', value: 'en' },
  { title: '繁體中文', value: 'zh-TW' },
  { title: '简体中文', value: 'zh-CN' },
  { title: '日本語', value: 'ja' },
];

const LOCALE_IMPORTS: Record<LocaleCode, string | null> = {
  en: null,
  'zh-TW': 'zhTW',
  'zh-CN': 'zhCN',
  ja: 'ja',
};

export interface InitOptions {
  dir: string;
  force: boolean;
  name: string | undefined;
  packageManager: PackageManager;
  install: boolean;
  git: boolean;
  locale: LocaleCode;
}

export function sanitizeDirName(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '.' || trimmed === '..') return trimmed;
  const cleaned = trimmed
    .replace(/\s+/g, '-')
    .replace(/[^\\\p{L}\p{N}_./-]/gu, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-*([/\\])-*/g, '$1');
  if (cleaned === '' || /^[/\\]+$/.test(cleaned)) return 'my-slides';
  return cleaned;
}

export async function isDirNonEmpty(target: string): Promise<boolean> {
  if (!existsSync(target)) return false;
  const entries = await readdir(target);
  return entries.some((e) => !e.startsWith('.'));
}

declare const __CORE_VERSION_AT_BUILD__: string;

function coreVersionRange(): string {
  return `^${__CORE_VERSION_AT_BUILD__}`;
}

async function linkOrCopy(relSrc: string, dst: string): Promise<void> {
  await rm(dst, { recursive: true, force: true });
  if (IS_WINDOWS) {
    await cp(resolve(dirname(dst), relSrc), dst, { recursive: true });
    return;
  }
  await symlink(relSrc, dst);
}

async function materializeClaudeMdLink(target: string): Promise<void> {
  const claudeMd = join(target, 'CLAUDE.md');
  if (!existsSync(claudeMd) && existsSync(join(target, 'AGENTS.md'))) {
    await linkOrCopy('AGENTS.md', claudeMd);
  }
}

async function syncSkills(target: string): Promise<boolean> {
  const bin = join(target, 'node_modules', '.bin', IS_WINDOWS ? 'open-slide.cmd' : 'open-slide');
  if (!existsSync(bin)) return false;
  await new Promise<void>((res, rej) => {
    const child = spawn(bin, ['sync:skills'], { cwd: target, stdio: 'inherit', shell: IS_WINDOWS });
    child.on('error', rej);
    child.on('close', (code) =>
      code === 0 ? res() : rej(new Error(`open-slide sync:skills exited with code ${code}`)),
    );
  });
  return true;
}

function renderConfigFile(locale: LocaleCode): string {
  const localeImport = LOCALE_IMPORTS[locale];
  if (!localeImport) {
    return [
      "import type { OpenSlideConfig } from '@open-slide/core';",
      '',
      'const openSlideConfig: OpenSlideConfig = {};',
      '',
      'export default openSlideConfig;',
      '',
    ].join('\n');
  }
  return [
    "import type { OpenSlideConfig } from '@open-slide/core';",
    `import { ${localeImport} } from '@open-slide/core/locale';`,
    '',
    'const openSlideConfig: OpenSlideConfig = {',
    `  locale: ${localeImport},`,
    '};',
    '',
    'export default openSlideConfig;',
    '',
  ].join('\n');
}

async function runInstall(pm: PackageManager, cwd: string): Promise<void> {
  await new Promise<void>((res, rej) => {
    const child = spawn(pm, ['install'], { cwd, stdio: 'inherit', shell: IS_WINDOWS });
    child.on('error', rej);
    child.on('close', (code) =>
      code === 0 ? res() : rej(new Error(`${pm} install exited with code ${code}`)),
    );
  });
}

export async function init(opts: InitOptions): Promise<void> {
  const { dir, force, name, packageManager, install, git, locale } = opts;

  if (!existsSync(TEMPLATE_DIR)) {
    throw new Error(
      `Template missing at ${TEMPLATE_DIR}. If you are running from source, run \`pnpm --filter @open-slide/cli build\` first.`,
    );
  }

  const target = resolve(process.cwd(), dir);
  await mkdir(target, { recursive: true });

  if ((await isDirNonEmpty(target)) && !force) {
    throw new Error(`Target ${target} is not empty. Pass --force to scaffold into it anyway.`);
  }

  await cp(TEMPLATE_DIR, target, { recursive: true });
  await materializeClaudeMdLink(target);

  const pkgPath = join(target, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as Record<string, unknown> & {
      dependencies?: Record<string, string>;
    };
    pkg.name = name ?? basename(target);
    pkg.version = '0.0.0';
    pkg.private = true;
    if (pkg.dependencies?.['@open-slide/core']) {
      pkg.dependencies['@open-slide/core'] = coreVersionRange();
    }
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  const configPath = join(target, 'open-slide.config.ts');
  if (existsSync(configPath)) {
    await writeFile(configPath, renderConfigFile(locale));
  }

  await writeFile(join(target, '.gitignore'), 'node_modules\ndist\n.DS_Store\n');

  const cdTarget = dir === '.' ? basename(target) : dir;
  process.stdout.write(
    `\n${chalk.green.bold('✔ Created open-slide workspace')} ${chalk.dim(`in ${target}`)}\n`,
  );

  let installed = false;
  let skillsSynced = false;
  if (install) {
    process.stdout.write(`\n${chalk.bold(`Installing dependencies with ${packageManager}…`)}\n\n`);
    try {
      await runInstall(packageManager, target);
      installed = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(
        `\n${chalk.yellow('! Dependency install failed:')} ${chalk.dim(msg)}\n` +
          chalk.dim(`  You can retry manually with \`${packageManager} install\`.\n`),
      );
    }
  }

  if (installed) {
    process.stdout.write(`\n${chalk.bold('Setting up Claude Code skills…')}\n`);
    try {
      skillsSynced = await syncSkills(target);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(
        `${chalk.yellow('! Skill setup failed:')} ${chalk.dim(msg)}\n` +
          chalk.dim('  open-slide dev will offer to set them up on first run.\n'),
      );
    }
  }

  if (git) {
    const result = await gitInitAndCommit(target);
    if (result.status === 'committed') {
      process.stdout.write(`${chalk.green('✔')} Initialized git repository with first commit.\n`);
    } else if (result.status === 'skipped-nested') {
      process.stdout.write(
        `${chalk.yellow('!')} Skipped ${chalk.bold('git init')}: ${chalk.dim(result.message ?? '')}\n`,
      );
    } else if (result.status === 'skipped-no-git') {
      process.stdout.write(
        `${chalk.yellow('!')} Skipped git setup: ${chalk.dim(result.message ?? '')}\n`,
      );
    } else {
      process.stdout.write(
        `${chalk.yellow('!')} Git setup failed: ${chalk.dim(result.message ?? '')}\n` +
          chalk.dim('  You can initialize the repo manually.\n'),
      );
    }
  }

  process.stdout.write(`\n${chalk.bold('Next steps:')}\n`);
  process.stdout.write(`  ${chalk.cyan(`cd ${cdTarget}`)}\n`);
  if (!installed && install) {
    process.stdout.write(`  ${chalk.cyan(`${packageManager} install`)}\n`);
  } else if (!install) {
    process.stdout.write(
      `  ${chalk.cyan(`${packageManager} install`)}    ${chalk.dim('# install was skipped')}\n`,
    );
  }
  const devCommand = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
  process.stdout.write(`  ${chalk.cyan(devCommand)}\n`);
  if (!skillsSynced) {
    process.stdout.write(chalk.dim('\nSkills will be set up the first time you run dev.\n'));
  }
}

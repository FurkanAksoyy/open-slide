import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE_PKG = path.resolve(HERE, '..', '..', 'core', 'package.json');
const OUT = path.resolve(HERE, '..', 'src', 'core-version.ts');

async function main() {
  const pkg = JSON.parse(await readFile(CORE_PKG, 'utf8'));
  const version = pkg.version;
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error(`@open-slide/core has no version at ${CORE_PKG}.`);
  }
  const body = `export const CORE_VERSION_BAKED = '${version}';\n`;
  await writeFile(OUT, body);
  process.stdout.write(`Baked @open-slide/core@${version} into src/core-version.ts.\n`);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
});

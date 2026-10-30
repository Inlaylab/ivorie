// Package smoke: builds both apps against the `npm pack` tarball instead of the source paths.
// Do not run while another check uses this node_modules: it installs @ivorie/ui there for a while.
// Usage: npm run smoke:pack
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SMOKE = '.smoke';
// A library-only class (tabs): present only when Tailwind scanned the library's files.
const PROBE = 'data-horizontal\\:flex-col';

const run = (cmd: string) => execSync(cmd, { stdio: 'inherit' });

function docsCss(): string {
  const dir = 'dist/docs/browser';
  const file = readdirSync(dir).find((f) => /^styles-.*\.css$/.test(f));
  if (!file) throw new Error(`no styles-*.css in ${dir}`);
  return readFileSync(join(dir, file), 'utf8');
}

let ok = false;
try {
  run('npx ng build ui');
  rmSync(SMOKE, { recursive: true, force: true });
  mkdirSync(SMOKE);
  const out = execSync(`npm pack ./dist/ui --pack-destination ${SMOKE} --json`, { encoding: 'utf8' });
  const tgz = JSON.parse(out)[0].filename as string;

  // Sanity: the source build has the probe class, so its absence later means a packaging bug.
  run('node tools/docs/build.ts && npx ng build docs');
  if (!docsCss().includes(PROBE)) throw new Error(`source docs CSS lacks ${PROBE}: probe is stale`);

  run(`npm install --no-save ./${SMOKE}/${tgz}`);
  run('npx ng build docs -c production,pack');
  run('npx ng build module-smoke -c production,pack');
  if (!docsCss().includes(PROBE)) throw new Error(`pack docs CSS lacks ${PROBE}: theme @source misses the package`);

  run('node tools/smoke/ssr.ts');
  ok = true;
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
} finally {
  rmSync('node_modules/@ivorie/ui', { recursive: true, force: true });
}

console.log(ok ? 'PASS smoke-pack' : 'FAIL smoke-pack');
process.exit(ok ? 0 : 1);

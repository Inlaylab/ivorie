// The NgModule smoke app must import every IV_*_IMPORTS array and every entry point.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const UI = 'projects/ui';
const MODULE = 'apps/module-smoke/src/app/app.module.ts';

const entries = [
  ...readdirSync(UI).filter((d) => d !== 'src' && existsSync(join(UI, d, 'public-api.ts'))),
  ...readdirSync(join(UI, 'extras'))
    .filter((d) => existsSync(join(UI, 'extras', d, 'public-api.ts')))
    .map((d) => `extras/${d}`),
];

function tsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsFiles(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : [],
  );
}

const imports = [
  ...new Set(
    tsFiles(UI).flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/export const (IV_\w+_IMPORTS)/g)].map((m) => m[1]),
    ),
  ),
];

const source = existsSync(MODULE) ? readFileSync(MODULE, 'utf8') : '';

test('finds the 24 IMPORTS arrays', () => {
  assert.equal(imports.length, 24);
});

test('module imports every IV_*_IMPORTS', () => {
  const missing = imports.filter((name) => !new RegExp(`\\b${name}\\b`).test(source));
  assert.deepEqual(missing, [], `${MODULE}: missing ${missing.join(', ')}`);
});

test('module imports from every entry point', () => {
  const missing = entries.filter((e) => !source.includes(`'@ivorie/ui/${e}'`));
  assert.deepEqual(missing, [], `${MODULE}: missing ${missing.join(', ')}`);
});

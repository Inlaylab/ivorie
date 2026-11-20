import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readConfig, validateConfig, type ComponentsJson } from '../src/config.ts';

const valid: ComponentsJson = {
  $schema: 'https://ivorie.dev/schema/components.json',
  path: 'src/app/ui',
  prefix: 'iv',
  theme: 'maia',
  tailwind: { css: 'src/styles.css', baseColor: 'neutral' },
  font: 'system',
  radius: 'default',
  iconLibrary: 'lucide',
};

test('bad prefixes throw with the pattern', () => {
  for (const prefix of ['Acme', '1x', 'a-b']) {
    assert.throws(() => validateConfig({ ...valid, prefix }), /\^\[a-z\]\[a-z0-9\]\*\$/);
  }
});

test('no path throws', () => {
  const { path: _, ...rest } = valid;
  assert.throws(() => validateConfig(rest), /path/);
});

test('a valid object round-trips', () => {
  assert.deepEqual(validateConfig(structuredClone(valid)), valid);
});

test('readConfig reads components.json or says to run init', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ivorie-cfg-'));
  assert.throws(() => readConfig(dir), { message: 'components.json not found — run "ivorie init"' });
  writeFileSync(join(dir, 'components.json'), JSON.stringify(valid));
  assert.deepEqual(readConfig(dir), valid);
});

test('"preset" (the saved look with its dials) must be a string when present', () => {
  const base = { $schema: 'x', path: 'src/app/ui', prefix: 'iv', theme: 'slate', tailwind: { css: 'src/styles.css', baseColor: 'zinc' }, font: 'geist', radius: 'small', iconLibrary: 'lucide' };
  assert.equal(validateConfig({ ...base, preset: 'ivp1_x' }).preset, 'ivp1_x');
  assert.throws(() => validateConfig({ ...base, preset: 3 }), /"preset" must be a non-empty string/);
});

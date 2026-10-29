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
  style: 'maia',
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

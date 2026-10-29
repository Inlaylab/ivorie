import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { rewritePrefix } from '../src/prefix.ts';

const dir = mkdtempSync(join(tmpdir(), 'ivorie-prefix-'));
build(dir);
process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
const item = (name: string) => JSON.parse(readFileSync(join(dir, 'r', `${name}.json`), 'utf8'));
const button = item('button').files.find((f: { path: string }) => f.path.endsWith('/button.ts')).content as string;

const sample = [
  "selector: 'button[ivButton], a[ivButton]'",
  'export class IvButton {}',
  'imports: [IV_CARD_IMPORTS]',
  '<iv-tabs></iv-tabs>',
  "host: 'iv-accordion'",
  'IvorieModule provideIvorie IvorieConfig ivory cn-button data-slot="button" style-maia',
].join('\n');

test('prefix iv leaves content unchanged', () => {
  assert.equal(rewritePrefix(button, 'iv'), button);
  assert.equal(rewritePrefix(sample, 'iv'), sample);
});

test('prefix acme rewrites only prefix tokens', () => {
  const out = rewritePrefix(sample, 'acme');
  assert.match(out, /selector: 'button\[acmeButton\], a\[acmeButton\]'/);
  assert.match(out, /export class AcmeButton/);
  assert.match(out, /ACME_CARD_IMPORTS/);
  assert.match(out, /<acme-tabs><\/acme-tabs>/);
  assert.match(out, /'acme-accordion'/);
  assert.match(out, /IvorieModule provideIvorie IvorieConfig ivory cn-button data-slot="button" style-maia/);
  assert.match(rewritePrefix(button, 'acme'), /selector: 'button\[acmeButton\], a\[acmeButton\]'/);
});

test('no iv tokens survive in any registry item', () => {
  for (const f of readdirSync(join(dir, 'r'))) {
    for (const file of JSON.parse(readFileSync(join(dir, 'r', f), 'utf8')).files ?? []) {
      const out = rewritePrefix(file.content, 'acme');
      const left = out.match(/\biv-[a-z]|\biv[A-Z]|\bIv[A-Z]|\bIV_/g);
      assert.equal(left, null, `${file.path}: ${left?.join(', ')}`);
    }
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { build } from './build.ts';

const dirA = mkdtempSync(join(tmpdir(), 'ivorie-reg-a-'));
const dirB = mkdtempSync(join(tmpdir(), 'ivorie-reg-b-'));
build(dirA);
build(dirB);
process.on('exit', () => [dirA, dirB].forEach((d) => rmSync(d, { recursive: true, force: true })));

const names = readdirSync(join(dirA, 'r')).sort();
const items = names.map((f) => JSON.parse(readFileSync(join(dirA, 'r', f), 'utf8')));

test('no library import paths and no test or build files', () => {
  for (const item of items) {
    for (const f of item.files ?? []) {
      assert.doesNotMatch(f.content, /@inlaylab\/ivorie/, f.path);
      assert.doesNotMatch(f.path, /\.spec\.ts$|ng-package\.json$/);
    }
  }
});

test('every item passes the shadcn item schema', () => {
  for (const item of items) registryItemSchema.parse(item);
});

test('registry.json passes the shadcn registry schema', () => {
  registrySchema.parse(JSON.parse(readFileSync(join(dirA, 'registry.json'), 'utf8')));
});

test('every registry dependency exists and there are no cycles', () => {
  const deps = new Map(items.map((i) => [i.name, (i.registryDependencies ?? []) as string[]]));
  for (const [name, list] of deps) for (const d of list) assert.ok(deps.has(d), `${name} → ${d}`);
  const state = new Map<string, 'open' | 'done'>();
  const visit = (n: string, path: string[]) => {
    if (state.get(n) === 'done') return;
    assert.notEqual(state.get(n), 'open', `cycle: ${[...path, n].join(' → ')}`);
    state.set(n, 'open');
    for (const d of deps.get(n)!) visit(d, [...path, n]);
    state.set(n, 'done');
  };
  for (const n of deps.keys()) visit(n, []);
});

test('index.json lists every item and the preset axes', () => {
  const index = JSON.parse(readFileSync(join(dirA, 'index.json'), 'utf8'));
  assert.equal(index.items.length, items.length);
  assert.ok(index.styles.includes('maia'));
  assert.deepEqual(index.baseColors, ['neutral']);
  assert.equal(index.presets.default.style, 'maia');
});

test('building twice gives byte-identical output', () => {
  const read = (d: string) =>
    ['index.json', 'registry.json', ...names.map((n) => `r/${n}`)].map((f) => readFileSync(join(d, f), 'utf8'));
  assert.deepEqual(read(dirA), read(dirB));
});

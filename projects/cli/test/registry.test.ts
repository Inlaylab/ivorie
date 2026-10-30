import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { openRegistry, packageName, resolveTree } from '../src/registry.ts';

const dir = mkdtempSync(join(tmpdir(), 'ivorie-tree-'));
build(dir);
process.on('exit', () => rmSync(dir, { recursive: true, force: true }));

test('resolveTree: core first, deps before dependents, each once', async () => {
  const names = (await resolveTree(openRegistry(dir), ['select-picker', 'button'])).map((i) => i.name);
  assert.equal(names[0], 'core');
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.indexOf('button') < names.indexOf('select-picker'));
  assert.ok(names.indexOf('dialog') < names.indexOf('select-picker'));
});

test('a missing local item names the file', async () => {
  await assert.rejects(openRegistry(dir).item('nope'), /registry file not found: .*nope\.json/);
});

test('packageName strips the range, keeps the scope', () => {
  assert.equal(packageName('@angular/cdk@^22.0.0'), '@angular/cdk');
  assert.equal(packageName('clsx@^2.1.1'), 'clsx');
  assert.equal(packageName('@lucide/angular@>=1.61.0'), '@lucide/angular');
  assert.equal(packageName('clsx'), 'clsx');
});

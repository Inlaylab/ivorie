import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectDeps, listEntries, normalizeRange, registryDeps, rewriteImports } from './items.ts';

test('rewriteImports points entry imports at the copied folder', () => {
  assert.equal(rewriteImports("import { cn } from '@ivorie/ui/core';"), "import { cn } from '../core/public-api';");
  assert.equal(
    rewriteImports("from '@ivorie/ui/extras/select-picker'"),
    "from '../select-picker/public-api'",
  );
  assert.equal(rewriteImports("import { X } from './button';"), "import { X } from './button';");
});

test('normalizeRange turns a one-major range into a caret', () => {
  assert.equal(normalizeRange('>=22.0.0 <23.0.0'), '^22.0.0');
  assert.equal(normalizeRange('>=1.61.0'), '>=1.61.0');
  assert.equal(normalizeRange('^3.7.0'), '^3.7.0');
});

const entries = listEntries();

test('entries: 33 components + core + select-picker', () => {
  const names = entries.map((e) => e.name);
  assert.equal(names.length, 35);
  assert.ok(names.includes('core'));
  assert.ok(names.includes('select-picker'));
  assert.ok(!names.includes('src') && !names.includes('styles') && !names.includes('testing'));
});

const byName = (n: string) => entries.find((e) => e.name === n)!;

test('collectDeps lists npm deps with ranges, never Angular core packages', () => {
  const select = collectDeps(byName('select'));
  assert.ok(select.includes('@angular/cdk@^22.0.0'), select.join());
  for (const e of entries) {
    for (const d of collectDeps(e)) {
      assert.doesNotMatch(d, /^(@angular\/(core|common|forms|router)|rxjs|tslib)@/, `${e.name}: ${d}`);
    }
  }
});

test('registryDeps follows @ivorie/ui imports', () => {
  const picker = registryDeps(byName('select-picker'));
  for (const d of ['core', 'dialog', 'button', 'checkbox', 'input', 'table', 'card']) {
    assert.ok(picker.includes(d), `select-picker needs ${d}`);
  }
  for (const e of entries) {
    const usesCore = e.files.some((f) => f.content.includes("'@ivorie/ui/core'"));
    if (usesCore) assert.ok(registryDeps(e).includes('core'), e.name);
  }
});

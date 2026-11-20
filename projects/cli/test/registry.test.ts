import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { openRegistry, packageName, resolveTree } from '../src/registry.ts';
import { encodePreset, resolvePreset } from '../src/preset.ts';

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

// A 1.5 registry (components.json "registry"): `styles`, not `themes`; named presets say style/theme.
test('a 1.5-shaped index reads as themes, and its named presets map style → theme, theme → accent', async () => {
  const old = mkdtempSync(join(tmpdir(), 'ivorie-reg15-'));
  process.on('exit', () => rmSync(old, { recursive: true, force: true }));
  const preset = { style: 'nova', theme: 'blue', baseColor: 'neutral', font: 'system', radius: 'default', iconLibrary: 'lucide', fontHeading: 'inherit', chartColor: 'theme', menuAccent: 'subtle' };
  writeFileSync(join(old, 'index.json'), JSON.stringify({
    version: '1.5.2', items: [], styles: ['nova'], baseColors: ['neutral'], accents: ['blue'], fonts: ['system'], radii: ['default'],
    presets: { default: preset, nova: preset },
  }));
  const index = await openRegistry(old).index();
  assert.deepEqual(index.themes, ['nova']);
  assert.deepEqual([index.presets.nova.theme, index.presets.nova.accent, index.presets.nova.chartColor], ['nova', 'blue', 'accent']);
  assert.equal(resolvePreset('nova', index).theme, 'nova');
  assert.equal(resolvePreset(undefined, index).accent, 'blue');
});

// A hosted 1.5 registry still lists graphite (no slate): the 1.6 alias must not send graphite to slate there.
test('a 1.5 registry that has graphite and no slate: graphite by name and by code stays graphite', async () => {
  const old = mkdtempSync(join(tmpdir(), 'ivorie-reg15g-'));
  process.on('exit', () => rmSync(old, { recursive: true, force: true }));
  const preset = { style: 'graphite', theme: 'base', baseColor: 'neutral', font: 'system', radius: 'default', iconLibrary: 'lucide', fontHeading: 'inherit', chartColor: 'theme', menuAccent: 'subtle' };
  writeFileSync(join(old, 'index.json'), JSON.stringify({
    version: '1.5.2', items: [], styles: ['nova', 'graphite'], baseColors: ['neutral'], accents: ['blue'], fonts: ['system'], radii: ['default'],
    presets: { default: preset, graphite: preset },
  }));
  const index = await openRegistry(old).index();
  assert.equal(resolvePreset('graphite', index).theme, 'graphite');
  assert.equal(resolvePreset(encodePreset({ ...resolvePreset('graphite', index) }), index).theme, 'graphite');
});

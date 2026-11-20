import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { build } from './build.ts';
import { THEME_ORDER } from './themes.ts';
import { DIALS, checkPreset, type DialKey } from '../../projects/cli/src/preset.ts';

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
      // Blocks keep them: add rewrites each import to the app's copied component.
      if (item.meta.ivorie.kind !== 'block') assert.doesNotMatch(f.content, /@inlaylab\/ivorie/, f.path);
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
  assert.ok(index.themes.includes('maia'));
  assert.deepEqual(index.baseColors, ['mauve', 'mist', 'neutral', 'olive', 'stone', 'taupe', 'zinc']);
  assert.equal(index.presets.default.theme, 'slate');
  assert.equal(index.fonts.length, 27);
  assert.equal(index.fonts[0], 'system');
  assert.deepEqual(index.radii, ['default', 'none', 'small', 'medium', 'large']);
});

test('one font item per font, with family and package', () => {
  const inter = items.find((i) => i.name === 'font-inter');
  assert.equal(inter.type, 'registry:font');
  assert.equal(inter.font.family, "'Inter Variable', sans-serif");
  assert.equal(inter.font.dependency, '@fontsource-variable/inter');
  assert.equal(items.filter((i) => i.meta.ivorie.kind === 'font').length, 26);
});

test('building twice gives byte-identical output', () => {
  const read = (d: string) =>
    ['index.json', 'registry.json', ...names.map((n) => `r/${n}`)].map((f) => readFileSync(join(d, f), 'utf8'));
  assert.deepEqual(read(dirA), read(dirB));
});

test('chart and the blocks that reach it list the d3 @types as devDependencies', () => {
  const root = JSON.parse(readFileSync('package.json', 'utf8')).devDependencies;
  const want = ['d3-scale', 'd3-shape'].map((p) => `@types/${p}@${root[`@types/${p}`]}`);
  const byName = (n: string) => items.find((i) => i.name === n);
  assert.deepEqual(byName('chart').devDependencies, want);
  assert.deepEqual(byName('dashboard-01').devDependencies, want);
  assert.equal(byName('button').devDependencies, undefined);
});

test('a block lists the npm deps of the components it reaches, transitively', () => {
  const login = items.find((i) => i.name === 'login-01');
  assert.ok(login.dependencies.some((d: string) => d.startsWith('class-variance-authority@')), login.dependencies.join());
});

test('themeDials matches the dial table; legacy themes listed', () => {
  const index = JSON.parse(readFileSync(join(dirA, 'index.json'), 'utf8'));
  assert.deepEqual(Object.keys(index.themeDials).sort(), [...index.themes].sort());
  assert.deepEqual(index.themeDials.glass, ['density', 'contrast', 'motion', 'panels', 'rim', 'shadow', 'blur', 'ambient']);
  assert.deepEqual(index.themeDials.bento, ['density', 'contrast', 'motion', 'panels', 'rim', 'shadow']);
  assert.deepEqual(index.themeDials.slate, ['density', 'contrast', 'motion', 'rim', 'shadow']);
  assert.deepEqual(index.themeDials.tint, ['density', 'contrast', 'motion', 'panels', 'shadow']);
  assert.deepEqual(index.themeDials.mono, ['density', 'contrast', 'motion']);
  assert.deepEqual(index.themeDials.clay, ['density', 'contrast', 'motion', 'panels', 'rim', 'shadow']);
  assert.equal(index.presets.clay.theme, 'clay');
  assert.deepEqual(index.themeDials.midnight, ['density', 'contrast', 'motion', 'panels', 'rim', 'shadow', 'blur']);
  assert.deepEqual(index.themeDials.nova, ['density', 'contrast', 'motion']);
  assert.deepEqual(index.legacyThemes, ['vega', 'maia', 'rhea', 'lyra']);
});

test('themes: one per theme file, default is slate, each resolves and only sets dials its theme takes', () => {
  const index = JSON.parse(readFileSync(join(dirA, 'index.json'), 'utf8'));
  assert.deepEqual([...THEME_ORDER], ['slate', 'glass', 'bento', 'midnight', 'clay', 'mono', 'tint', 'nova', 'luma', 'mira', 'sera']);
  assert.deepEqual(Object.keys(index.presets).sort(), ['default', 'graphite', ...THEME_ORDER].sort());
  assert.deepEqual(index.presets.default, index.presets.slate);
  // graphite: the 1.5 name, kept for 1.5 CLIs until 2.0.
  assert.deepEqual(index.presets.graphite, index.presets.slate);
  for (const name of THEME_ORDER) {
    const theme = index.presets[name];
    assert.equal(theme.theme, name);
    assert.doesNotThrow(() => checkPreset(theme, index), name);
    for (const dial of Object.keys(DIALS) as DialKey[]) {
      if (theme[dial] !== DIALS[dial][0]) assert.ok(index.themeDials[theme.theme].includes(dial), `${name}: ${dial}`);
    }
  }
  const pick = (p: Record<string, string>) => [p.baseColor, p.accent, p.font, p.fontHeading, p.radius];
  assert.deepEqual(pick(index.presets.slate), ['zinc', 'blue', 'geist', 'inherit', 'small']);
  assert.deepEqual(pick(index.presets.glass), ['neutral', 'violet', 'inter', 'inherit', 'large']);
  assert.deepEqual(pick(index.presets.nova), ['zinc', 'indigo', 'dm-sans', 'inherit', 'default']);
  assert.deepEqual(pick(index.presets.luma), ['mist', 'cyan', 'nunito-sans', 'inherit', 'large']);
  assert.deepEqual(pick(index.presets.mira), ['neutral', 'emerald', 'ibm-plex-sans', 'inherit', 'small']);
  assert.deepEqual(pick(index.presets.sera), ['taupe', 'red', 'source-sans-3', 'playfair-display', 'none']);
  assert.equal(index.presets.mira.density, 'compact');
});

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { renderLook } from '../src/look.ts';
import { FILL_PRESET, droppedDials } from '../src/preset.ts';
import { PRESET_GOLDEN } from './preset.fixture.ts';
import { openRegistry, type Registry } from '../src/registry.ts';
import { renderTheme } from '../src/theme.ts';

let dir: string;
let reg: Registry;
before(() => {
  dir = mkdtempSync(join(tmpdir(), 'ivorie-look-'));
  build(dir);
  reg = openRegistry(dir);
});
after(() => rmSync(dir, { recursive: true, force: true }));

const item = (name: string) => JSON.parse(readFileSync(join(dir, 'r', `${name}.json`), 'utf8'));
// Patches over the neutral fill (nova, neutral, system font), so each test sees only its own change.
const look = (patch: Partial<typeof FILL_PRESET>) =>
  renderLook({ ...FILL_PRESET, ...patch }, reg, 'src/app/ui', 'src/styles.css');

test('neutral fill: plain theme, nova, no fonts', async () => {
  const l = await look({});
  const expected = renderTheme({ base: item('theme-base').files[0].content, ...item('theme-neutral').cssVars }, { imports: false });
  assert.equal(l.themeCss, expected);
  assert.equal(l.themeFile, 'theme-nova.css');
  assert.equal(l.themeFileCss, item('style-nova').files[0].content);
  assert.deepEqual(l.dependencies, []);
  assert.deepEqual(l.imports, [
    '@import "tailwindcss";',
    '@import "tw-animate-css";',
    '@import "./app/ui/styles/theme.css";',
    '@import "./app/ui/styles/theme-nova.css";',
  ]);
});

test('radius large sets --radius once', async () => {
  const { themeCss } = await look({ radius: 'large' });
  assert.equal(themeCss.match(/--radius: /g)?.length, 1);
  assert.match(themeCss, /^ {2}--radius: 0\.875rem;$/m);
});

test('font inter: token, package and import', async () => {
  const l = await look({ font: 'inter' });
  assert.match(l.themeCss, /@theme \{\n {2}--font-sans: 'Inter Variable', sans-serif;\n\}\n$/);
  assert.deepEqual(l.dependencies, ['@fontsource-variable/inter']);
  assert.equal(l.imports[2], '@import "@fontsource-variable/inter";');
});

test('golden preset: both fonts, olive, nova', async () => {
  const l = await renderLook(PRESET_GOLDEN.preset, reg, 'src/app/ui', 'src/styles.css');
  assert.match(l.themeCss, /--font-sans: 'Inter Variable', sans-serif;\n {2}--font-heading: 'Lora Variable', serif;/);
  assert.match(l.themeCss, /--primary: oklch\(0\.228 0\.013 107\.4\);/);
  assert.deepEqual(l.dependencies, ['@fontsource-variable/inter', '@fontsource-variable/lora']);
  assert.equal(l.themeFile, 'theme-nova.css');
});

test('a heading font alone keeps the body font', async () => {
  const { themeCss } = await look({ fontHeading: 'lora' });
  assert.doesNotMatch(themeCss, /--font-sans:/);
  assert.match(themeCss, /--font-heading: 'Lora Variable', serif;/);
});

test('accent preset: blue primary, emerald charts, bold menu accent', async () => {
  const l = await look({ accent: 'blue', chartColor: 'emerald', menuAccent: 'bold' });
  const blue = item('theme-accent-blue').cssVars;
  const emerald = item('theme-accent-emerald').cssVars;
  const root = l.themeCss.slice(l.themeCss.indexOf(':root {'), l.themeCss.indexOf('}', l.themeCss.indexOf(':root {')));
  assert.ok(root.includes(`--primary: ${blue.light['--primary']};`));
  assert.ok(root.includes(`--chart-1: ${emerald.light['--chart-1']};`));
  assert.ok(root.includes(`--accent: ${blue.light['--primary']};`));
  const dark = l.themeCss.slice(l.themeCss.indexOf('.dark {'));
  assert.ok(dark.includes(`--chart-3: ${emerald.dark['--chart-3']};`));
});

test('density compact writes --spacing', async () => {
  const { themeCss } = await look({ density: 'compact' });
  assert.match(themeCss, /^ {2}--spacing: 0\.2rem;$/m);
});

test('default dials write nothing', async () => {
  const { themeCss, notes } = await renderLook(FILL_PRESET, reg, 'src/app/ui', 'src/styles.css');
  assert.doesNotMatch(themeCss, /--iv-|--spacing:|--default-transition|!important|--border: color-mix/);
  assert.deepEqual(notes, []);
});

test('a dial the style does not take is dropped with a note', async () => {
  const p = { ...FILL_PRESET, theme: 'nova', rim: 'strong' };
  const l = await renderLook(p, reg, 'src/app/ui', 'src/styles.css');
  assert.doesNotMatch(l.themeCss, /--iv-rim/);
  assert.deepEqual(droppedDials(p, ['density', 'contrast', 'motion']), ['rim']);
  assert.deepEqual(l.notes, ['dial "rim" does nothing on theme "nova"']);
});

test('motion off adds the no-motion rule', async () => {
  const { themeCss } = await look({ motion: 'off' });
  assert.match(themeCss, /animation-duration: 0s !important/);
});

test('contrast remixes border and input in both modes, muted text only when high', async () => {
  const remixed = (css: string, name: string) =>
    css.split('.dark {').map((block) => new RegExp(`--${name}: color-mix\\(in oklab, `).test(block));
  const soft = (await look({ contrast: 'soft' })).themeCss;
  const high = (await look({ contrast: 'high' })).themeCss;
  for (const name of ['border', 'input']) assert.deepEqual(remixed(soft, name), [true, true]);
  assert.deepEqual(remixed(soft, 'muted-foreground'), [false, false]);
  assert.deepEqual(remixed(high, 'muted-foreground'), [true, true]);
});

test('own styles take their own dials from the index', async () => {
  const l = await look({ theme: 'glass', rim: 'strong', blur: 'low' });
  assert.match(l.themeCss, /^ {2}--iv-rim: 2\.2;$/m);
  assert.match(l.themeCss, /^ {2}--iv-blur: 0\.3;$/m);
  assert.deepEqual(l.notes, []);
});

test('a legacy style still renders, with a note', async () => {
  const l = await look({ theme: 'maia' });
  assert.equal(l.themeFile, 'theme-maia.css');
  assert.deepEqual(l.notes, ['theme \"maia\" is legacy and leaves in 2.0']);
});

test('ambient vivid on glass writes --iv-ambient; on nova it is dropped with a note', async () => {
  assert.match((await look({ theme: 'glass', ambient: 'vivid' })).themeCss, /^ {2}--iv-ambient: 2\.5;$/m);
  const nova = await look({ ambient: 'vivid' });
  assert.doesNotMatch(nova.themeCss, /--iv-ambient/);
  assert.deepEqual(nova.notes, ['dial "ambient" does nothing on theme "nova"']);
});

test('contrast soft keeps 40% of the border and input, toward the background', async () => {
  const { themeCss } = await look({ contrast: 'soft' });
  const root = themeCss.slice(themeCss.indexOf(':root {'), themeCss.indexOf('.dark {'));
  assert.match(root, /--border: color-mix\(in oklab, oklch\([^)]+\) 40%, oklch\(1 0 0\)\);/);
  assert.match(root, /--input: color-mix\(in oklab, oklch\([^)]+\) 40%, oklch\(1 0 0\)\);/);
});

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { renderLook } from '../src/look.ts';
import { DEFAULT_PRESET } from '../src/preset.ts';
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
const look = (patch: Partial<typeof DEFAULT_PRESET>) =>
  renderLook({ ...DEFAULT_PRESET, ...patch }, reg, 'src/app/ui', 'src/styles.css');

test('default preset: plain theme, nova, no fonts', async () => {
  const l = await look({});
  const expected = renderTheme({ base: item('theme-base').files[0].content, ...item('theme-neutral').cssVars }, { imports: false });
  assert.equal(l.themeCss, expected);
  assert.equal(l.styleFile, 'style-nova.css');
  assert.equal(l.styleCss, item('style-nova').files[0].content);
  assert.deepEqual(l.dependencies, []);
  assert.deepEqual(l.imports, [
    '@import "tailwindcss";',
    '@import "tw-animate-css";',
    '@import "./app/ui/styles/theme.css";',
    '@import "./app/ui/styles/style-nova.css";',
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
  assert.equal(l.styleFile, 'style-nova.css');
});

test('a heading font alone keeps the body font', async () => {
  const { themeCss } = await look({ fontHeading: 'lora' });
  assert.doesNotMatch(themeCss, /--font-sans:/);
  assert.match(themeCss, /--font-heading: 'Lora Variable', serif;/);
});

test('accent preset: blue primary, emerald charts, bold menu accent', async () => {
  const l = await look({ theme: 'blue', chartColor: 'emerald', menuAccent: 'bold' });
  const blue = item('theme-accent-blue').cssVars;
  const emerald = item('theme-accent-emerald').cssVars;
  const root = l.themeCss.slice(l.themeCss.indexOf(':root {'), l.themeCss.indexOf('}', l.themeCss.indexOf(':root {')));
  assert.ok(root.includes(`--primary: ${blue.light['--primary']};`));
  assert.ok(root.includes(`--chart-1: ${emerald.light['--chart-1']};`));
  assert.ok(root.includes(`--accent: ${blue.light['--primary']};`));
  const dark = l.themeCss.slice(l.themeCss.indexOf('.dark {'));
  assert.ok(dark.includes(`--chart-3: ${emerald.dark['--chart-3']};`));
});

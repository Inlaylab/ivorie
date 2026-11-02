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

test('default preset: plain theme, maia, no fonts', async () => {
  const l = await look({});
  const expected = renderTheme({ base: item('theme-base').files[0].content, ...item('theme-neutral').cssVars }, { imports: false });
  assert.equal(l.themeCss, expected);
  assert.equal(l.styleFile, 'style-maia.css');
  assert.equal(l.styleCss, item('style-maia').files[0].content);
  assert.deepEqual(l.dependencies, []);
  assert.deepEqual(l.imports, [
    '@import "tailwindcss";',
    '@import "tw-animate-css";',
    '@import "./app/ui/styles/theme.css";',
    '@import "./app/ui/styles/style-maia.css";',
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

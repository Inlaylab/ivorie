// Every style file must compile with Tailwind: an unknown utility in an @apply fails the build of every app.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@tailwindcss/node';
import { STYLES, themeNames } from './hooks.ts';

const base = resolve(STYLES);

for (const file of themeNames().map((n) => `theme-${n}.css`)) {
  test(`${file} compiles`, async () => {
    const css = `@import "./theme.css";\n@import "./${file}";\n`;
    const compiler = await compile(css, { base, onDependency: () => {} });
    const out = compiler.build([]);
    assert.ok(out.includes(`.theme-${file.slice(6, -4)}`), 'the theme scope is in the output');
  });
}

// Own styles that read their material dials. Grows as each material takes its dials.
const MATERIAL_DIALS: Record<string, string[]> = {
  glass: ['panel-solid', 'rim', 'shadow', 'blur', 'ambient'],
  bento: ['panel-solid', 'rim', 'shadow'],
  slate: ['rim', 'shadow'],
  tint: ['panel-solid', 'shadow'],
  midnight: ['panel-solid', 'rim', 'shadow', 'blur'],
  clay: ['panel-solid', 'rim', 'shadow'],
};

for (const [style, vars] of Object.entries(MATERIAL_DIALS)) {
  const css = readFileSync(resolve(STYLES, `theme-${style}.css`), 'utf8');
  test(`theme-${style}.css reads its dials`, () => {
    for (const v of vars) assert.ok(css.includes(`var(--iv-${v}, `), `--iv-${v}`);
  });
  if (vars.includes('panel-solid')) {
    test(`theme-${style}.css: the reduced-transparency (and no-blur) fallbacks force solid panels`, () => {
      const heads = ['@media (prefers-reduced-transparency: reduce)'];
      if (vars.includes('blur')) heads.push('@supports not (backdrop-filter: blur(1px))');
      for (const head of heads) {
        const at = css.indexOf(head);
        assert.ok(at >= 0, head);
        assert.match(css.slice(at, css.indexOf('}', at)), /--iv-panel-solid: 1;/, head);
      }
    });
  }
}

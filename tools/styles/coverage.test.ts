// Theme style files must cover every cn-* hook the components use, and nothing else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STYLES, uiHooks, themeNames } from './hooks.ts';

const hooks = uiHooks();
const styleFiles = themeNames().map((n) => `theme-${n}.css`);

test('at least one style file exists', () => {
  assert.ok(styleFiles.length > 0);
});

for (const name of styleFiles) {
  const css = readFileSync(join(STYLES, name), 'utf8');
  const rules = new Set([...css.matchAll(/\.(cn-[a-z0-9-]*[a-z0-9])\b/g)].map((m) => m[1]));

  test(`${name} has a rule for every hook`, () => {
    assert.deepEqual([...hooks].filter((h) => !rules.has(h)).sort(), []);
  });

  test(`${name} has no rule without a hook`, () => {
    assert.deepEqual([...rules].filter((r) => !hooks.has(r)).sort(), []);
  });

  test(`${name} is scoped to @layer components and .${name.slice(0, -4)} (or its 1.5 class)`, () => {
    const theme = name.slice(6, -4);
    // A renamed theme also lists its old classes (slate: .theme-graphite, .style-graphite).
    assert.match(css, new RegExp(`@layer components\\s*\\{\\s*:is\\(\\.theme-${theme}, \\.style-${theme}(, \\.(theme|style)-[a-z]+)*\\) \\{`));
  });
}

// Theme style files must cover every cn-* hook the components use, and nothing else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STYLES, uiHooks } from './hooks.ts';

const hooks = uiHooks();
const styleFiles = readdirSync(STYLES).filter((name) => /^style-[a-z]+\.css$/.test(name));

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

  test(`${name} is scoped to @layer components and .${name.slice(0, -4)}`, () => {
    assert.match(css, /@layer components\s*\{\s*\.style-[a-z]+\s*\{/);
    assert.ok(css.includes(`.${name.slice(0, -4)} {`));
  });
}

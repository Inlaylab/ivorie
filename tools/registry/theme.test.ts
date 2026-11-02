import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseTheme, renderTheme } from '../../projects/cli/src/theme.ts';

const css = readFileSync('projects/ui/styles/theme.css', 'utf8');

test('theme round trip is exact', () => {
  assert.equal(renderTheme(parseTheme(css), { imports: true }), css);
});

test('parseTheme reads light and dark vars', () => {
  const parts = parseTheme(css);
  assert.equal(parts.light['--radius'], '0.625rem');
  assert.ok(parts.dark['--background']);
  assert.doesNotMatch(parts.base, /:root \{|\n\.dark \{/);
});

test('CLI form drops the package imports', () => {
  const out = renderTheme(parseTheme(css), { imports: false });
  assert.doesNotMatch(out, /@import "tailwindcss"|@import "tw-animate-css"/);
  assert.match(out, /:root \{\n  --background: /);
});

test('parseTheme throws without the var blocks', () => {
  assert.throws(() => parseTheme('a {}'), /no :root block/);
});

const colorsDir = 'tools/registry/base-colors';
const color = (n: string) => JSON.parse(readFileSync(`${colorsDir}/${n}.json`, 'utf8'));
const BASE_COLORS = ['neutral', 'stone', 'zinc', 'mauve', 'olive', 'mist', 'taupe'];

test('neutral.json equals the theme.css var blocks, in order', () => {
  const { light, dark } = parseTheme(css);
  assert.deepEqual(Object.entries(color('neutral').light), Object.entries(light));
  assert.deepEqual(color('neutral').dark, dark);
});

test('every base color has the same var keys as neutral', () => {
  const ref = color('neutral');
  for (const n of BASE_COLORS) {
    assert.deepEqual(Object.keys(color(n).light).sort(), Object.keys(ref.light).sort(), n);
    assert.deepEqual(Object.keys(color(n).dark).sort(), Object.keys(ref.dark).sort(), n);
    assert.ok(color(n).title, n);
  }
});

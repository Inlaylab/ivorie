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

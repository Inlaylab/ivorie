// Run after `npx ng build ui`: reads the built package in dist/ui.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const theme = readFileSync('projects/ui/styles/theme.css', 'utf8');

test('theme sets no font', () => {
  assert.doesNotMatch(theme, /Figtree/);
  // --font-heading may point at --font-sans; the theme must not define it.
  assert.doesNotMatch(theme, /--font-sans:/);
});

test('theme has the shadcn dark variant', () => {
  assert.ok(theme.includes('@custom-variant dark (&:is(.dark *));'));
});

test('theme has the shadcn data-state variants', () => {
  assert.ok(theme.includes('@custom-variant data-open {'));
  assert.ok(theme.includes('@custom-variant data-horizontal {'));
});

test('theme has the shadcn no-scrollbar utility (maia combobox uses it)', () => {
  assert.ok(theme.includes('@utility no-scrollbar {'));
});

test('package exports ./styles/style-maia.css', () => {
  const pkg = JSON.parse(readFileSync('dist/ui/package.json', 'utf8'));
  assert.equal(pkg.exports['./styles/style-maia.css']?.default, './styles/style-maia.css');
  assert.ok(existsSync('dist/ui/styles/style-maia.css'));
});

test('package exports ./styles/theme.css', () => {
  const pkg = JSON.parse(readFileSync('dist/ui/package.json', 'utf8'));
  const entry = pkg.exports['./styles/theme.css'];
  assert.ok(entry === './styles/theme.css' || entry?.default === './styles/theme.css', JSON.stringify(entry));
  assert.ok(existsSync('dist/ui/styles/theme.css'));
});

test('theme has the shadcn base layer (border and outline colors, body)', () => {
  assert.ok(theme.includes('@apply border-border outline-ring/50;'));
  assert.ok(theme.includes('@apply bg-background text-foreground;'));
});

test('every style root re-declares the radius scale, so a --radius set there reaches var(--radius-*)', () => {
  const rule = theme.match(/:where\(\[class\*="style-"\]\) \{([^}]*)\}/)?.[1] ?? '';
  for (const size of ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']) {
    assert.match(rule, new RegExp(`--radius-${size}:`), size);
  }
});

test('theme has the shadcn accordion keyframes', () => {
  assert.ok(theme.includes('@keyframes accordion-down {'));
  assert.ok(theme.includes('--accordion-panel-height'));
});

const SHADCN_STYLES = ['vega', 'nova', 'maia', 'luma', 'rhea'];

test('every shadcn style has a source file and a package export', () => {
  const pkg = JSON.parse(readFileSync('projects/ui/package.json', 'utf8'));
  for (const name of SHADCN_STYLES) {
    assert.ok(existsSync(`projects/ui/styles/style-${name}.css`), name);
    assert.equal(pkg.exports[`./styles/style-${name}.css`]?.default, `./styles/style-${name}.css`, name);
  }
});

// Hand-made styles: tools/styles/own/<name>.css, derived over a synced style by tools/styles/derive.ts.
const OWN_STYLES = ['glass', 'brutal', 'aurora', 'bento', 'mono'];

test('every own style has a source file and a package export', () => {
  const pkg = JSON.parse(readFileSync('projects/ui/package.json', 'utf8'));
  for (const name of OWN_STYLES) {
    assert.ok(existsSync(`tools/styles/own/${name}.css`), name);
    assert.ok(existsSync(`projects/ui/styles/style-${name}.css`), name);
    assert.equal(pkg.exports[`./styles/style-${name}.css`]?.default, `./styles/style-${name}.css`, name);
  }
});

// The published package ships .mjs, not .ts: without it Tailwind finds no library classes.
test('theme @source covers the shipped .mjs files', () => {
  assert.ok(theme.includes('@source "../**/*.{html,ts,mjs}";'));
});

test('every radius token follows --radius (shadcn scale), so a preset radius reaches rounded-2xl..4xl too', () => {
  const scale = {
    sm: 'calc(var(--radius) * 0.6)',
    md: 'calc(var(--radius) * 0.8)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) * 1.4)',
    '2xl': 'calc(var(--radius) * 1.8)',
    '3xl': 'calc(var(--radius) * 2.2)',
    '4xl': 'calc(var(--radius) * 2.6)',
  };
  for (const [size, value] of Object.entries(scale)) {
    assert.ok(theme.includes(`--radius-${size}: ${value};`), `--radius-${size}`);
  }
});

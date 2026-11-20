import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EVERY_ELEMENT, NOT_PREVIEW, cliPin, packStyles, siteLook, siteStyle } from './site-style.ts';
import { DEFAULT_PRESET, RADII } from '../../projects/cli/src/preset.ts';
import { THEMES } from '../registry/themes.ts';

const read = (name: string) => readFileSync(`projects/ui/styles/theme-${name}.css`, 'utf8');

for (const name of ['nova', 'glass']) {
  test(`site ${name}: every hook rule skips previews of another style, nothing else changes`, () => {
    const css = read(name);
    const site = siteStyle(name, css);
    // Every selector line that names a hook: alone, after `&`, nested, or in a list.
    const selectors = css.split('\n').filter((l) => /\.cn-[a-z0-9-]+( \{|,)$/.test(l) && !l.includes('@')).length;
    assert.ok(selectors > 250);
    assert.equal(site.split(NOT_PREVIEW).length - 1, selectors);
    const restored = site.replaceAll(NOT_PREVIEW, '').replaceAll(EVERY_ELEMENT, '& :where(*) {');
    assert.equal(restored.replace(`  .theme-${name} {`, `  :is(.theme-${name}, .style-${name}) {`), css);
  });
}

test('site style: a demo card (docs-preview with no docs-other mark) keeps the site style', () => {
  // Only a preview marked docs-other is skipped; the component page's demo frame has no mark.
  assert.equal(siteStyle('nova', '    .cn-button {\n'), '    .cn-button:not(.docs-other *) {\n');
});

test('site style: lists, nested hooks and the every-element token rule are covered', () => {
  const css = '    .cn-a,\n    .cn-b {\n    & .cn-c .cn-d {\n    & :where(*) {\n      @apply bg-(--x) .cn-e,\n';
  assert.equal(
    siteStyle('glass', css),
    `    .cn-a${NOT_PREVIEW},\n    .cn-b${NOT_PREVIEW} {\n    & .cn-c .cn-d${NOT_PREVIEW} {\n    ${EVERY_ELEMENT}\n      @apply bg-(--x) .cn-e,\n`,
  );
});

test('the site copy scopes to .theme-<name> only, without the 1.5 alias', () => {
  const css = siteStyle('glass', read('glass'));
  assert.ok(css.includes('  .theme-glass {\n'));
  assert.ok(!css.includes('.style-glass'));
});

const block = (css: string, sel: ':root' | '.dark') => {
  const start = css.indexOf(`${sel} {`);
  assert.ok(start >= 0, `no ${sel} block`);
  return css.slice(start, css.indexOf('}', start));
};

test('the site, the demos and ivorie init share one default: slate with the blue accent', () => {
  assert.equal(DEFAULT_PRESET.theme, 'slate');
  assert.equal(DEFAULT_PRESET.accent, 'blue');
  assert.deepEqual(THEMES.slate, DEFAULT_PRESET);
  assert.equal(THEMES.glass.accent, 'violet');
  assert.match(readFileSync('apps/docs/src/index.html', 'utf8'), /<body class="theme-slate">/);
});

test('siteLook: the preset colors on :root and .dark, the blue accent as primary, the preset radius', () => {
  const blue = JSON.parse(readFileSync('tools/registry/accent-colors/blue.json', 'utf8'));
  const css = siteLook(DEFAULT_PRESET);
  assert.ok(block(css, ':root').includes(`--primary: ${blue.light['--primary']};`));
  assert.ok(block(css, '.dark').includes(`--primary: ${blue.dark['--primary']};`));
  assert.ok(block(css, ':root').includes(`--radius: ${RADII[DEFAULT_PRESET.radius]};`));
});

test('styles.css takes the generated site look and carries no glow, beam, blur or gradient decoration', () => {
  const css = readFileSync('apps/docs/src/styles.css', 'utf8');
  assert.match(css, /@import "\.\/generated\/site-look\.css";/);
  assert.doesNotMatch(css, /docs-beam|docs-glow|brand-gradient|backdrop-filter|blur\(/);
  assert.doesNotMatch(css, /oklch\([^)]*29\d\.\d+\)/, 'no hand-copied violet tokens');
});

test('the site copy of a renamed theme drops its old classes (slate: no .theme-graphite in selectors)', () => {
  const css = siteStyle('slate', readFileSync('projects/ui/styles/theme-slate.css', 'utf8'));
  assert.ok(css.includes('  .theme-slate {\n'));
  assert.ok(!/\.(theme|style)-graphite/.test(css));
});

// The pack build must be the site's own stylesheet with the library taken from the tarball (M7).
test('styles.pack.css is styles.css with the library from the package', () => {
  const pack = readFileSync('apps/docs/src/styles.pack.css', 'utf8');
  assert.equal(pack, packStyles(readFileSync('apps/docs/src/styles.css', 'utf8'), DEFAULT_PRESET.theme));
  assert.match(pack, /@import "@inlaylab\/ivorie\/styles\/theme-slate\.css";/);
  assert.match(pack, /@source not "\.\.\/\.\.\/\.\.\/projects\/ui";/);
  assert.doesNotMatch(pack, /@import "[^"]*(projects\/ui\/styles|generated\/site-style)/);
});

test('cliPin: the minor for a release, the exact version for a prerelease', () => {
  assert.equal(cliPin('1.6.0'), 'npx ivorie@1.6');
  assert.equal(cliPin('1.6.3'), 'npx ivorie@1.6');
  assert.equal(cliPin('2.0.0-beta.2'), 'npx ivorie@2.0.0-beta.2');
});

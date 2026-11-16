import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EVERY_ELEMENT, NOT_PREVIEW, siteStyle } from './site-style.ts';

const read = (name: string) => readFileSync(`projects/ui/styles/style-${name}.css`, 'utf8');

for (const name of ['nova', 'glass']) {
  test(`site ${name}: every hook rule skips previews of another style, nothing else changes`, () => {
    const css = read(name);
    const site = siteStyle(name, css);
    // Every selector line that names a hook: alone, after `&`, nested, or in a list.
    const selectors = css.split('\n').filter((l) => /\.cn-[a-z0-9-]+( \{|,)$/.test(l) && !l.includes('@')).length;
    assert.ok(selectors > 250);
    assert.equal(site.split(NOT_PREVIEW).length - 1, selectors);
    assert.equal(site.replaceAll(NOT_PREVIEW, '').replaceAll(EVERY_ELEMENT, '& :where(*) {'), css);
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

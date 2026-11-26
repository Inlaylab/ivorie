import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { changelogRss, parseChangelog, splitItems } from './changelog.ts';

test('splitItems: one HTML string per list item, inline markup kept', () => {
  assert.deepEqual(splitItems('<ul>\n<li>One <code>a</code>.</li>\n<li>Two\nlines.</li>\n</ul>\n'), ['One <code>a</code>.', 'Two\nlines.']);
  assert.deepEqual(splitItems('<p>Not a list.</p>'), ['<p>Not a list.</p>']);
});

test('parseChangelog: version, date, title and the New / Changed / Improvements / Fixes sections; the package line is dropped', () => {
  const md = '# Changelog\n\n## 1.1.0 — 2026-11-02\n\nNew parts.\n\nBoth packages: x and y 1.1.0.\n\n### New\n\n- One.\n- Two.\n\n### Fixes\n\n- Three.\n\n## 1.0.0 — 2026-10-29\n\nFirst release.\n\n### New\n\n- Four.\n';
  assert.deepEqual(parseChangelog(md), [
    { version: '1.1.0', date: '2026-11-02', title: 'New parts', sections: [{ kind: 'new', label: 'New', body: '- One.\n- Two.' }, { kind: 'fixes', label: 'Fixes', body: '- Three.' }] },
    { version: '1.0.0', date: '2026-10-29', title: 'First release', sections: [{ kind: 'new', label: 'New', body: '- Four.' }] },
  ]);
});

test('parseChangelog: an unknown section, notes outside a section or sections out of order are errors', () => {
  const head = '## 1.0.0 — 2026-10-29\n\nFirst release.\n\n';
  assert.throws(() => parseChangelog(head + '### Misc\n\n- x\n'), /unknown section "Misc"/);
  assert.throws(() => parseChangelog(head + '- loose\n\n### New\n\n- x\n'), /notes outside a section/);
  assert.throws(() => parseChangelog(head + '### Fixes\n\n- x\n\n### New\n\n- y\n'), /out of order/);
});

test('changelogRss: one item per release, newest first, absolute links to its anchor, notes as escaped HTML', () => {
  const xml = changelogRss(
    [
      { version: '1.1.0', date: '2026-11-02', title: 'Tabs & menus', sections: [{ label: 'New', html: '<ul><li>One</li></ul>' }] },
      { version: '1.0.0', date: '2026-10-29', title: 'First release', sections: [{ label: 'Fixes', html: '<p>]]> safe</p>' }] },
    ],
    'https://inlaylab.github.io/ivorie/',
  );
  assert.match(xml, /^<\?xml version="1\.0" encoding="utf-8"\?>\n<rss version="2\.0"/);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  assert.equal(items.length, 2);
  assert.match(items[0], /<title>1\.1\.0 — Tabs &amp; menus<\/title>/);
  assert.match(items[0], /<link>https:\/\/inlaylab\.github\.io\/ivorie\/changelog\/#v1-1-0<\/link>/);
  assert.match(items[0], /<guid isPermaLink="true">https:\/\/inlaylab\.github\.io\/ivorie\/changelog\/#v1-1-0<\/guid>/);
  assert.match(items[0], /<pubDate>Mon, 02 Nov 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(items[0], /<description>&lt;h3&gt;New&lt;\/h3&gt;&lt;ul&gt;&lt;li&gt;One/);
  assert.match(items[1], /\]\]&gt; safe/);
});

test('CHANGELOG.md: every release has a date, a title and at least one section, newest first', () => {
  const entries = parseChangelog(readFileSync('CHANGELOG.md', 'utf8'));
  assert.ok(entries.length >= 10);
  for (const e of entries) {
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/, e.version);
    assert.ok(e.title.length > 0 && !e.title.startsWith('-'), e.version);
    assert.ok(e.sections.length > 0 && e.sections.every((s) => s.body.length > 0), e.version);
  }
  const dates = entries.map((e) => e.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

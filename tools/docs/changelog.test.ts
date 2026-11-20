import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseChangelog } from './changelog.ts';

test('parseChangelog: version, date and title from each release; the package line is dropped', () => {
  const md = '# Changelog\n\n## 1.1.0 — 2026-11-02\n\nNew parts.\n\nBoth packages: x and y 1.1.0.\n\n- One.\n- Two.\n\n## 1.0.0 — 2026-10-29\n\nFirst release.\n\n- Three.\n';
  assert.deepEqual(parseChangelog(md), [
    { version: '1.1.0', date: '2026-11-02', title: 'New parts', body: '- One.\n- Two.' },
    { version: '1.0.0', date: '2026-10-29', title: 'First release', body: '- Three.' },
  ]);
});

test('CHANGELOG.md: every release has a date and a title, newest first', () => {
  const entries = parseChangelog(readFileSync('CHANGELOG.md', 'utf8'));
  assert.ok(entries.length >= 10);
  for (const e of entries) {
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/, e.version);
    assert.ok(e.title.length > 0 && !e.title.startsWith('-'), e.version);
    assert.ok(e.body.length > 0, e.version);
  }
  const dates = entries.map((e) => e.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

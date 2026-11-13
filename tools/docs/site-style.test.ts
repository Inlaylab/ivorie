import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { siteNova } from './site-style.ts';

test('site nova: every hook rule skips previews of another style, nothing else changes', () => {
  const nova = readFileSync('projects/ui/styles/style-nova.css', 'utf8');
  const site = siteNova(nova);
  const rules = nova.match(/^ {4}\.cn-[a-z0-9-]+ \{$/gm)!.length;
  assert.ok(rules > 100);
  assert.equal(site.match(/^ {4}\.cn-[a-z0-9-]+:not\(\.docs-preview:not\(\.style-nova\) \*\) \{$/gm)!.length, rules);
  assert.equal(site.replaceAll(':not(.docs-preview:not(.style-nova) *)', ''), nova);
});

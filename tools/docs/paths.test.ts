// The docs can be served under a base href (GitHub Pages: /<repo>/). Root-absolute paths
// ignore <base href>, so assets and prose links must be relative to it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function files(dir: string, ext: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name), ext) : e.name.endsWith(ext) ? [join(dir, e.name)] : [],
  );
}

test('app templates use base-relative asset paths', () => {
  const bad = files('apps/docs/src/app', '.ts')
    .filter((f) => !f.endsWith('.spec.ts'))
    .flatMap((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .map((line, i) => (/\s(src|href)="\/(?!\/)/.test(line) ? `${f}:${i + 1}` : null))
        .filter((x): x is string => x !== null),
    );
  assert.deepEqual(bad, []);
});

test('markdown prose links are base-relative', () => {
  const bad = files('apps/docs/content', '.md').flatMap((f) => {
    // Code fences are samples for the reader's app, not links on this site.
    const prose = readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, '');
    return [...prose.matchAll(/\]\(\/[^)]*\)/g)].map((m) => `${f}: ${m[0]}`);
  });
  assert.deepEqual(bad, []);
});

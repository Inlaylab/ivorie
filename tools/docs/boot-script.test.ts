// The inline appearance script in apps/docs/src/index.html runs before Angular. It must never throw,
// whatever localStorage holds or does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync('apps/docs/src/index.html', 'utf8');
const script = /<body[^>]*>[\s\S]*?<script>([\s\S]*?)<\/script>/.exec(html)![1];

function run(storage: { getItem(key: string): string | null }, prefersDark = false) {
  const classes = new Set<string>();
  const head: unknown[] = [];
  const document = {
    documentElement: { classList: { add: (c: string) => classes.add(c) }, style: { colorScheme: '' } },
    body: { className: 'style-maia' },
    head: { appendChild: (el: unknown) => head.push(el) },
    createElement: () => ({}),
  };
  const context = {
    document,
    matchMedia: () => ({ matches: prefersDark }),
    get localStorage() {
      return storage;
    },
  };
  runInNewContext(script, context);
  return { dark: classes.has('dark'), body: document.body.className, links: head.length };
}

test('no saved state: defaults, system mode follows the media query', () => {
  assert.deepEqual(run({ getItem: () => null }), { dark: false, body: 'style-maia', links: 0 });
  assert.equal(run({ getItem: () => null }, true).dark, true);
});

test('corrupt JSON: defaults, no throw', () => {
  assert.deepEqual(run({ getItem: () => '{bad' }), { dark: false, body: 'style-maia', links: 0 });
});

test('getItem throws: defaults, no throw', () => {
  const r = run({
    getItem: () => {
      throw new Error('SecurityError');
    },
  });
  assert.deepEqual(r, { dark: false, body: 'style-maia', links: 0 });
});

test('localStorage getter throws: no throw', () => {
  const classes: string[] = [];
  runInNewContext(script, {
    document: { documentElement: { classList: { add: (c: string) => classes.push(c) } } },
    get localStorage(): never {
      throw new Error('SecurityError');
    },
  });
  assert.deepEqual(classes, []);
});

test('saved dark mode and a known style apply', () => {
  const r = run({ getItem: () => JSON.stringify({ mode: 'dark', style: 'vega' }) });
  assert.deepEqual(r, { dark: true, body: 'style-vega', links: 1 });
});

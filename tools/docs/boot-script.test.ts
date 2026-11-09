// The inline appearance script in apps/docs/src/index.html runs before Angular. It must never throw,
// whatever localStorage holds or does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync('apps/docs/src/index.html', 'utf8');
const script = /<body[^>]*>[\s\S]*?<script>([\s\S]*?)<\/script>/.exec(html)![1];

function run(storage: { getItem(key: string): string | null }, prefersDark = false) {
  // index.html ships <html class="dark">: the script only removes it.
  const classes = new Set<string>(['dark']);
  const head: unknown[] = [];
  const document = {
    documentElement: {
      classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) },
      style: { colorScheme: '' },
    },
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

test('no saved state: dark, whatever the OS prefers', () => {
  assert.deepEqual(run({ getItem: () => null }), { dark: true, body: 'style-maia', links: 0 });
  assert.equal(run({ getItem: () => null }, true).dark, true);
});

test('saved light removes dark; saved system follows the media query', () => {
  assert.equal(run({ getItem: () => '{"mode":"light"}' }, true).dark, false);
  assert.equal(run({ getItem: () => '{"mode":"system"}' }, false).dark, false);
  assert.equal(run({ getItem: () => '{"mode":"system"}' }, true).dark, true);
});

test('corrupt JSON: defaults, no throw', () => {
  assert.deepEqual(run({ getItem: () => '{bad' }), { dark: true, body: 'style-maia', links: 0 });
});

test('getItem throws: defaults, no throw', () => {
  const r = run({
    getItem: () => {
      throw new Error('SecurityError');
    },
  });
  assert.deepEqual(r, { dark: true, body: 'style-maia', links: 0 });
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

test('saved dark mode applies; a saved style is ignored (the site is always maia)', () => {
  const r = run({ getItem: () => JSON.stringify({ mode: 'dark', style: 'vega' }) });
  assert.deepEqual(r, { dark: true, body: 'style-maia', links: 0 });
});

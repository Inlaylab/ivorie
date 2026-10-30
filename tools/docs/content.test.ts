import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPage,
  createHighlighter,
  createRenderer,
  parseFrontmatter,
  slugify,
  splitDemos,
} from './content.ts';

const render = createRenderer(await createHighlighter());

const md = (fm: string, body = 'Body.') => `---\n${fm}\n---\n\n${body}\n`;
const TABS_FM = "title: Tabs\ndescription: Tab panels.\nsection: component\nentry: '@inlaylab/ivorie/tabs'";

test('frontmatter: title, description, section and entry parse', () => {
  const { data, body } = parseFrontmatter(md(TABS_FM), 'x.md');
  assert.deepEqual(data, {
    title: 'Tabs',
    description: 'Tab panels.',
    section: 'component',
    entry: '@inlaylab/ivorie/tabs',
  });
  assert.equal(body.trim(), 'Body.');
});

test('frontmatter: guide order is a number', () => {
  const { data } = parseFrontmatter(md('title: A\ndescription: B\nsection: guide\norder: 2'), 'x.md');
  assert.equal(data.order, 2);
});

test('frontmatter: no title throws', () => {
  assert.throws(() => parseFrontmatter(md('description: B\nsection: guide'), 'x.md'), {
    message: 'x.md: missing title',
  });
});

test('frontmatter: component without entry throws', () => {
  assert.throws(
    () => parseFrontmatter(md('title: A\ndescription: B\nsection: component'), 'x.md'),
    { message: 'x.md: missing entry' },
  );
});

test('splitDemos: marker splits the text', () => {
  const parts = splitDemos('Intro.\n\n<!-- demo: tabs-vertical -->\n\nAfter.');
  assert.deepEqual(
    parts.map((p) => (p.kind === 'demo' ? `demo:${p.name}` : 'md')),
    ['md', 'demo:tabs-vertical', 'md'],
  );
});

test('splitDemos: marker inside a code fence is ignored', () => {
  const parts = splitDemos('Intro.\n\n```html\n<!-- demo: tabs-vertical -->\n```\n\nAfter.');
  assert.equal(parts.length, 1);
  assert.equal(parts[0].kind, 'md');
});

test('slugify: lowercase, dashes, no punctuation', () => {
  assert.equal(slugify('Two-way binding (ngModel)'), 'two-way-binding-ngmodel');
});

test('renderer: h2 gets a slug id', () => {
  assert.match(render('## Usage').html, /<h2 id="usage">/);
});

test('renderer: repeated headings get -1', () => {
  const { html } = render('## API\n\n## API');
  assert.match(html, /<h2 id="api">/);
  assert.match(html, /<h2 id="api-1">/);
});

test('renderer: toc holds only h2 and h3, in order', () => {
  const { toc } = render('# Top\n\n## A\n\n### B\n\n#### C\n\n## D');
  assert.deepEqual(toc, [
    { id: 'a', text: 'A', level: 2 },
    { id: 'b', text: 'B', level: 3 },
    { id: 'd', text: 'D', level: 2 },
  ]);
});

test('renderer: Angular and HTML code shows as text', () => {
  const { html } = render(
    '```html\n<p>{{ value }}</p>\n@if (x) {\n<script>alert(1)</script>\n}\n</div>\n```',
  );
  assert.match(html, /class="shiki/);
  // Shiki splits tokens into spans and escapes '<' as '&#x3C;'.
  const text = html.replace(/<[^>]+>/g, '');
  assert.match(text, /(&lt;|&#x3C;)script/);
  assert.match(text, /\{\{ value \}\}/);
  assert.doesNotMatch(html, /<script/);
});

test('renderer: unknown language falls back to text', () => {
  const { html } = render('```cobol\nDISPLAY "HI".\n```');
  assert.match(html, /class="shiki/);
  assert.ok(html.includes('DISPLAY'));
});

test('renderer: tables are wrapped', () => {
  const { html } = render('| A | B |\n|---|---|\n| 1 | 2 |');
  assert.match(html, /<div class="docs-table"><table>/);
});

const page = (body: string, demos: Map<string, string>) =>
  buildPage({ slug: 'tabs', file: 'tabs.md', md: md(TABS_FM, body), demos, render });

test('buildPage: component without main demo throws', () => {
  assert.throws(() => page('Hi.', new Map()), {
    message: 'missing main demo: apps/docs/src/app/demos/tabs/tabs.ts',
  });
});

test('buildPage: unknown demo marker throws', () => {
  assert.throws(() => page('<!-- demo: zz -->', new Map([['tabs', 'x']])), {
    message: 'unknown demo "zz" in tabs.md',
  });
});

test('buildPage: component page starts with its main demo', () => {
  const p = page('Hi.', new Map([['tabs', 'x']]));
  assert.deepEqual(p.segments[0], { kind: 'demo', name: 'tabs' });
  assert.deepEqual(p.segments[1], { kind: 'install', slug: 'tabs', entry: '@inlaylab/ivorie/tabs' });
  assert.equal(p.entry, '@inlaylab/ivorie/tabs');
});

test('buildPage: demos holds only used demos with raw source', () => {
  const demos = new Map([
    ['tabs', 'const a = 1;'],
    ['tabs-vertical', 'const b = 2;'],
    ['button', 'const c = 3;'],
  ]);
  const p = page('## Examples\n\n<!-- demo: tabs-vertical -->', demos);
  assert.deepEqual(Object.keys(p.demos).sort(), ['tabs', 'tabs-vertical']);
  assert.equal(p.demos['tabs-vertical'].raw, 'const b = 2;');
  assert.match(p.demos['tabs'].code, /class="shiki/);
  assert.deepEqual(p.toc, [{ id: 'examples', text: 'Examples', level: 2 }]);
});

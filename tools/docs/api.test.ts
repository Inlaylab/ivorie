// Every public input/model/output is named in its docs page's ## API section.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseFrontmatter } from './content.ts';

const UI = 'projects/ui';
const CONTENT = 'apps/docs/content';
const SIGNAL = /readonly (\w+)\s*=\s*(input|model|output)(\.required)?\s*(<[^(]*?>)?\(([^)]*)\)/g;

const entries = readdirSync(UI)
  .filter((d) => d !== 'core' && d !== 'src' && existsSync(join(UI, d, 'public-api.ts')))
  .map((d) => join(UI, d))
  .concat(join(UI, 'extras/select-picker'));

function apiNames(dir: string): string[] {
  const names = new Set<string>();
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter(
    (f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'),
  );
  for (const file of files) {
    for (const m of readFileSync(join(dir, file), 'utf8').matchAll(SIGNAL)) {
      const name = /alias:\s*['"]([^'"]+)['"]/.exec(m[5])?.[1] ?? m[1];
      if (name !== 'class') names.add(name);
    }
  }
  return [...names].sort();
}

/** Text of the ## API section, or null. */
function apiSection(body: string): string | null {
  const m = /^## API\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(body);
  return m ? m[1] : null;
}

test('every entry has a docs page with Usage, API and Accessibility', () => {
  const problems: string[] = [];
  for (const dir of entries) {
    const md = join(CONTENT, `${basename(dir)}.md`).replaceAll('\\', '/');
    if (!existsSync(md)) {
      problems.push(`${md}: missing file`);
      continue;
    }
    let body: string;
    try {
      body = parseFrontmatter(readFileSync(md, 'utf8'), md).body;
    } catch (e) {
      problems.push((e as Error).message);
      continue;
    }
    const order = ['## Usage', '## API', '## Accessibility'].map((h) =>
      body.search(new RegExp(`^${h}\\s*$`, 'm')),
    );
    if (order.some((i) => i < 0) || order[0] > order[1] || order[1] > order[2]) {
      problems.push(`${md}: needs ## Usage, ## API, ## Accessibility in that order`);
      continue;
    }
    const api = apiSection(body) ?? '';
    const missing = apiNames(dir).filter((n) => !api.includes(`\`${n}\``));
    if (missing.length) problems.push(`${md}: missing ${missing.join(', ')}`);
  }
  assert.deepEqual(problems, []);
});

test('the scan finds names (sanity)', () => {
  assert.ok(apiNames(join(UI, 'tabs')).includes('orientation'));
  assert.ok(apiNames(join(UI, 'button')).includes('variant'));
  // Double-quoted alias.
  assert.ok(apiNames(join(UI, 'dialog')).includes('ivDialogClose'));
});

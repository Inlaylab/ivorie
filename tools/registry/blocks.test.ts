import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createIconMigrator } from '../../projects/cli/src/commands/migrate-icons.ts';
import { ICON_LIBRARIES } from '../../projects/cli/src/icons.ts';
import { buildItems } from './build.ts';

const blocks = buildItems().filter((i) => i.meta.ivorie.kind === 'block');
const byName = (n: string) => blocks.find((b) => b.name === n)!;

test('every block is a registry item', () => {
  assert.equal(blocks.length, 19);
  for (const b of blocks) {
    assert.ok(b.files!.length > 1, b.name);
    for (const f of b.files!) {
      assert.match(f.path, new RegExp(`^blocks/${b.name}/`), f.path);
      assert.doesNotMatch(f.path, /\.spec\.ts$/, f.path);
    }
  }
  const login = byName('login-01');
  assert.equal(login.title, 'Login 01');
  assert.match(login.description, /login form/);
  assert.deepEqual(login.registryDependencies, ['alert', 'button', 'card', 'field', 'input']);
  assert.ok(byName('login-02').dependencies!.some((d) => d.startsWith('@ng-icons/core@')));
  assert.ok(byName('login-02').dependencies!.some((d) => d.startsWith('@ng-icons/lucide@')));
  assert.ok(byName('dashboard-01').registryDependencies!.includes('data-table'));
});

test('block files keep their @inlaylab/ivorie imports (add rewrites them per app)', () => {
  const form = byName('login-01').files!.find((f) => f.path.endsWith('components/login-form.ts'))!;
  assert.match(form.content, /from '@inlaylab\/ivorie\/button'/);
});

test('block files are valid UTF-8', () => {
  for (const b of blocks) for (const f of b.files!) assert.doesNotMatch(f.content, /\uFFFD/, f.path);
});

/** Every lucide name used by a block, from the source. */
function blockIcons(): Set<string> {
  const names = new Set<string>();
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.ts') && !e.name.endsWith('.spec.ts'))
        for (const m of readFileSync(p, 'utf8').matchAll(/\blucide[A-Z0-9]\w*/g)) names.add(m[0]);
    }
  };
  walk('projects/blocks');
  return names;
}

test('every block icon is mapped for all libraries', () => {
  const icons = [...blockIcons()];
  assert.ok(icons.length > 10, icons.join());
  for (const lib of ICON_LIBRARIES.filter((l) => l !== 'lucide')) {
    const missing = new Set<string>();
    createIconMigrator('lucide', lib)(icons.join(' '), missing);
    assert.deepEqual([...missing], [], lib);
  }
});

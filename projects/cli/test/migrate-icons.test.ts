import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createIconMigrator, runMigrateIcons } from '../src/commands/migrate-icons.ts';

const TS = `import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHouse, lucideChevronDown, lucideSparkleWand } from '@ng-icons/lucide';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ lucideHouse, lucideChevronDown, lucideSparkleWand })],
  template: '<ng-icon name="lucideHouse" /><ng-icon [svg]="lucideChevronDown" />',
})
export class Nav {}
`;

test('lucide to tabler renames names and the import; unknown names stay and are reported', () => {
  const missing = new Set<string>();
  const out = createIconMigrator('lucide', 'tabler')(TS, missing);
  assert.match(out, /import \{ tablerHome, tablerChevronDown, lucideSparkleWand \} from '@ng-icons\/tabler-icons';/);
  assert.match(out, /name="tablerHome"/);
  assert.match(out, /\[svg\]="tablerChevronDown"/);
  assert.match(out, /from '@ng-icons\/core'/);
  assert.deepEqual([...missing], ['lucideSparkleWand']);
});

test('older lucide names migrate too', () => {
  assert.equal(createIconMigrator('lucide', 'tabler')('lucideHome lucideAlertCircle'), 'tablerHome tablerAlertCircle');
});

test('tabler back to lucide restores the mapped names; phosphor uses /regular', () => {
  const there = createIconMigrator('lucide', 'tabler')(TS);
  assert.equal(createIconMigrator('tabler', 'lucide')(there), TS);
  assert.match(createIconMigrator('lucide', 'phosphor')(TS), /from '@ng-icons\/phosphor-icons\/regular'/);
});

test('runMigrateIcons writes changed files and checks the libraries', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ivorie-icons-'));
  try {
    mkdirSync(join(cwd, 'src'));
    writeFileSync(join(cwd, 'src/nav.ts'), TS);
    writeFileSync(join(cwd, 'src/plain.html'), '<p>no icons</p>');
    const r = await runMigrateIcons([], { cwd, from: 'lucide', to: 'remix' });
    assert.deepEqual(r.written, ['src/nav.ts']);
    assert.match(readFileSync(join(cwd, 'src/nav.ts'), 'utf8'), /remixHome\w*/);
    await assert.rejects(runMigrateIcons([], { cwd, from: 'lucide', to: 'feather' }), /--to/);
    await assert.rejects(runMigrateIcons([], { cwd, from: 'tabler', to: 'tabler' }), /same library/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

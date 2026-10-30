import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { runMigrate } from '../src/commands/migrate.ts';

const CASES = 'projects/cli/test/fixtures/migrate';
const renameMap = 'tools/rename/rename-map.json';
const temps: string[] = [];
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

function tree(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else out[relative(dir, full).split('\\').join('/')] = readFileSync(full, 'utf8');
    }
  };
  walk(dir);
  return out;
}

function copy(name: string) {
  const dir = mkdtempSync(join(tmpdir(), `ivorie-migrate-${name}-`));
  temps.push(dir);
  cpSync(join(CASES, name, 'input'), dir, { recursive: true });
  return dir;
}

for (const name of readdirSync(CASES)) {
  test(`migrate: ${name}`, async () => {
    const cwd = copy(name);
    await runMigrate(['.'], { cwd, renameMap });
    assert.deepEqual(tree(cwd), tree(join(CASES, name, 'expected')));
    const again = await runMigrate(['.'], { cwd, renameMap });
    assert.deepEqual(again.written, [], 'second run changes nothing');
  });
}

test('manual notes point at the line', async () => {
  const r = await runMigrate(['.'], { cwd: copy('manual-notes'), renameMap });
  assert.deepEqual(r.notes, ['tabs.ts:2 IvTabs.setActive → select']);
});

test('dry run leaves the disk alone and lists the files', async () => {
  const cwd = copy('symbols-imports');
  const before = tree(cwd);
  const r = await runMigrate(['.'], { cwd, renameMap, dryRun: true });
  assert.deepEqual(r.written, ['app.ts']);
  assert.deepEqual(tree(cwd), before);
});

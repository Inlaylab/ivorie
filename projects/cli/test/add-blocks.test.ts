import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { runAdd } from '../src/commands/add.ts';
import type { ComponentsJson } from '../src/config.ts';

const temps: string[] = [];
const temp = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), `ivorie-${name}-`));
  temps.push(dir);
  return dir;
};

let registry: string;
before(() => {
  registry = temp('reg');
  build(registry);
});
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

function app(over: Partial<ComponentsJson> = {}) {
  const dir = temp('app');
  cpSync('projects/cli/test/fixtures/ng-app', dir, { recursive: true });
  const config: ComponentsJson = {
    $schema: 'https://ivorie.dev/schema/components.json',
    path: 'src/app/ui',
    prefix: 'iv',
    style: 'nova',
    tailwind: { css: 'src/styles.css', baseColor: 'neutral' },
    font: 'system',
    radius: 'default',
    iconLibrary: 'lucide',
    ...over,
  };
  writeFileSync(join(dir, 'components.json'), JSON.stringify(config, null, 2));
  return dir;
}

const read = (cwd: string, path: string) => readFileSync(join(cwd, path), 'utf8');

function allFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? allFiles(join(dir, d.name)) : [join(dir, d.name)],
  );
}

test('a block lands in src/app/blocks, with its components', async () => {
  const cwd = app();
  await runAdd(['login-01'], { cwd, registry, skipInstall: true });
  assert.ok(existsSync(join(cwd, 'src/app/blocks/login-01/login-01.ts')));
  assert.ok(existsSync(join(cwd, 'src/app/blocks/login-01/components/login-form.ts')));
  assert.ok(existsSync(join(cwd, 'src/app/ui/button/button.ts')));
  assert.ok(existsSync(join(cwd, 'src/app/ui/field/field.ts')));
  assert.ok(!existsSync(join(cwd, 'src/app/blocks/login-01/login-01.spec.ts')));
});

test('blocksPath in components.json wins', async () => {
  const cwd = app({ blocksPath: 'src/app/pages' });
  await runAdd(['login-01'], { cwd, registry, skipInstall: true });
  assert.ok(existsSync(join(cwd, 'src/app/pages/login-01/login-01.ts')));
});

test('imports are rewritten relative to each file', async () => {
  const cwd = app();
  await runAdd(['login-01'], { cwd, registry, skipInstall: true });
  const form = read(cwd, 'src/app/blocks/login-01/components/login-form.ts');
  assert.match(form, /from '\.\.\/\.\.\/\.\.\/ui\/button\/public-api'/);
  assert.doesNotMatch(form, /@inlaylab\/ivorie/);
  const page = read(cwd, 'src/app/blocks/login-01/login-01.ts');
  assert.match(page, /from '\.\/components\/login-form'/);
});

test("the block's npm deps come along", async () => {
  const cwd = app();
  const report = await runAdd(['login-02'], { cwd, registry, skipInstall: true });
  const note = report.notes.join(' ');
  assert.match(note, /@ng-icons\/core@/);
  assert.match(note, /@ng-icons\/lucide@/);
});

test('tabler rename leaves no lucide name', async () => {
  const cwd = app({ iconLibrary: 'tabler' });
  const report = await runAdd(['sidebar-07'], { cwd, registry, skipInstall: true });
  for (const f of allFiles(join(cwd, 'src/app/blocks/sidebar-07'))) {
    assert.doesNotMatch(readFileSync(f, 'utf8'), /lucide/, f);
  }
  assert.match(read(cwd, 'src/app/blocks/sidebar-07/data.ts'), /tablerTerminal2|tablerSquare|from '@ng-icons\/tabler-icons'/);
  const note = report.notes.join(' ');
  assert.match(note, /@ng-icons\/tabler-icons@/);
  assert.doesNotMatch(note, /@ng-icons\/lucide/);
});

test('--all excludes blocks', async () => {
  const cwd = app();
  await runAdd([], { cwd, registry, skipInstall: true, all: true });
  assert.ok(!existsSync(join(cwd, 'src/app/blocks')));
});

test('the prefix rewrite applies in block templates', async () => {
  const cwd = app({ prefix: 'ui' });
  await runAdd(['login-01'], { cwd, registry, skipInstall: true });
  const form = read(cwd, 'src/app/blocks/login-01/components/login-form.ts');
  assert.match(form, /<ui-card>/);
  assert.doesNotMatch(form, /<iv-card>/);
});

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
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

const config = (over: Partial<ComponentsJson> = {}): ComponentsJson => ({
  $schema: 'https://ivorie.dev/schema/components.json',
  path: 'src/app/ui',
  prefix: 'iv',
  style: 'maia',
  tailwind: { css: 'src/styles.css', baseColor: 'neutral' },
  font: 'system',
  radius: 'default',
  iconLibrary: 'lucide',
  ...over,
});

function app(over: Partial<ComponentsJson> = {}) {
  const dir = temp('app');
  cpSync('projects/cli/test/fixtures/ng-app', dir, { recursive: true });
  writeFileSync(join(dir, 'components.json'), JSON.stringify(config(over), null, 2));
  return dir;
}

const registryFile = (item: string, file: string) =>
  JSON.parse(readFileSync(join(registry, 'r', `${item}.json`), 'utf8')).files.find((f: { path: string }) =>
    f.path.endsWith(`/${file}`),
  ).content;

test('add button copies button and core, no specs', async () => {
  const cwd = app();
  await runAdd(['button'], { cwd, registry, skipInstall: true });
  const ui = join(cwd, 'src/app/ui');
  assert.ok(existsSync(join(ui, 'core/public-api.ts')));
  assert.ok(existsSync(join(ui, 'button/button.ts')) && existsSync(join(ui, 'button/public-api.ts')));
  for (const dir of readdirSync(ui)) {
    assert.ok(!readdirSync(join(ui, dir)).some((f) => f.endsWith('.spec.ts')), dir);
  }
  assert.equal(readFileSync(join(ui, 'button/button.ts'), 'utf8'), registryFile('button', 'button.ts'));
});

test('add select-picker brings its registry dependencies', async () => {
  const cwd = app();
  await runAdd(['select-picker'], { cwd, registry, skipInstall: true });
  for (const d of ['select-picker', 'dialog', 'button', 'checkbox', 'input', 'table', 'card', 'core']) {
    assert.ok(existsSync(join(cwd, 'src/app/ui', d)), d);
  }
});

test('a second run changes nothing; an edited file is skipped unless overwrite', async () => {
  const cwd = app();
  await runAdd(['button'], { cwd, registry, skipInstall: true });
  const again = await runAdd(['button'], { cwd, registry, skipInstall: true });
  assert.deepEqual(again.written, []);
  assert.ok(again.unchanged.length > 0);

  const file = join(cwd, 'src/app/ui/button/button.ts');
  writeFileSync(file, '// mine\n');
  const skipped = await runAdd(['button'], { cwd, registry, skipInstall: true });
  assert.deepEqual(skipped.skipped, [{ file: 'src/app/ui/button/button.ts', reason: 'modified (use --overwrite)' }]);
  assert.equal(readFileSync(file, 'utf8'), '// mine\n');

  const forced = await runAdd(['button'], { cwd, registry, skipInstall: true, overwrite: true });
  assert.ok(forced.written.includes('src/app/ui/button/button.ts'));
  assert.equal(readFileSync(file, 'utf8'), registryFile('button', 'button.ts'));
});

test('prefix acme renames selectors in the copy', async () => {
  const cwd = app({ prefix: 'acme' });
  await runAdd(['button'], { cwd, registry, skipInstall: true });
  assert.match(readFileSync(join(cwd, 'src/app/ui/button/button.ts'), 'utf8'), /acmeButton/);
});

test('dry run writes nothing and lists the files', async () => {
  const cwd = app();
  const r = await runAdd(['badge'], { cwd, registry, skipInstall: true, dryRun: true });
  assert.ok(r.written.includes('src/app/ui/badge/badge.ts'));
  assert.ok(!existsSync(join(cwd, 'src/app/ui')));
});

test('unknown and non-component names fail clearly', async () => {
  const cwd = app();
  await assert.rejects(runAdd(['buton'], { cwd, registry }), {
    message: 'unknown component "buton" — did you mean "button"?',
  });
  await assert.rejects(runAdd(['style-maia'], { cwd, registry }), {
    message: '"style-maia" is not a component — styles come from "ivorie init"',
  });
  await assert.rejects(runAdd([], { cwd, registry }), /name at least one component/);
});

test('skipInstall lists the missing npm deps of the whole tree', async () => {
  const cwd = app();
  const r = await runAdd(['button'], { cwd, registry, skipInstall: true });
  const note = r.notes.find((n) => n.startsWith('npm install '));
  assert.ok(note, r.notes.join('\n'));
  for (const pkg of ['class-variance-authority@', 'clsx@', 'tailwind-merge@']) assert.ok(note.includes(pkg), note);
});

test('a remote registry over http works; a 404 names the URL', async () => {
  const server: Server = createServer((req, res) => {
    const file = join(registry, decodeURIComponent(req.url!.split('?')[0]));
    if (!existsSync(file) || req.url!.includes('missing')) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(file));
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as { port: number }).port;
  try {
    const cwd = app();
    await runAdd(['badge'], { cwd, registry: `http://127.0.0.1:${port}`, skipInstall: true });
    assert.ok(existsSync(join(cwd, 'src/app/ui/badge/badge.ts')));
    await assert.rejects(runAdd(['badge'], { cwd, registry: `http://127.0.0.1:${port}/missing`, skipInstall: true }), {
      message: new RegExp(`http://127\\.0\\.0\\.1:${port}/missing/index\\.json: HTTP 404`),
    });
  } finally {
    server.close();
  }
});

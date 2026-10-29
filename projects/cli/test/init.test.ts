import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { runInit } from '../src/commands/init.ts';
import { DEFAULT_PRESET, encodePreset } from '../src/preset.ts';
import { renderTheme } from '../src/theme.ts';

const temps: string[] = [];
let registry: string;
before(() => {
  registry = mkdtempSync(join(tmpdir(), 'ivorie-reg-'));
  temps.push(registry);
  build(registry);
});
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

function app(fixture = 'ng-app') {
  const dir = mkdtempSync(join(tmpdir(), 'ivorie-init-'));
  temps.push(dir);
  cpSync(join('projects/cli/test/fixtures', fixture), dir, { recursive: true });
  return dir;
}

const read = (dir: string, file: string) => readFileSync(join(dir, file), 'utf8');
const item = (name: string) => JSON.parse(readFileSync(join(registry, 'r', `${name}.json`), 'utf8'));
const IMPORTS = [
  '@import "tailwindcss";',
  '@import "tw-animate-css";',
  '@import "./app/ui/styles/theme.css";',
  '@import "./app/ui/styles/style-maia.css";',
];

test('fresh ng-app: config, theme, style, imports, body class, postcss, core', async () => {
  const cwd = app();
  const userCss = read(cwd, 'src/styles.css');
  await runInit({ cwd, registry, skipInstall: true, yes: true });

  assert.deepEqual(JSON.parse(read(cwd, 'components.json')), {
    $schema: 'https://ivorie.dev/schema/components.json',
    path: 'src/app/ui',
    prefix: 'iv',
    style: 'maia',
    tailwind: { css: 'src/styles.css', baseColor: 'neutral' },
    font: 'system',
    radius: 'default',
    iconLibrary: 'lucide',
  });
  const base = item('theme-base').files[0].content;
  const vars = item('theme-neutral').cssVars;
  assert.equal(read(cwd, 'src/app/ui/styles/theme.css'), renderTheme({ base, ...vars }, { imports: false }));
  assert.equal(read(cwd, 'src/app/ui/styles/style-maia.css'), item('style-maia').files[0].content);
  assert.equal(read(cwd, 'src/styles.css'), IMPORTS.join('\n') + '\n' + userCss);
  assert.match(read(cwd, 'src/index.html'), /<body class="style-maia">/);
  assert.deepEqual(JSON.parse(read(cwd, '.postcssrc.json')), { plugins: { '@tailwindcss/postcss': {} } });
  assert.ok(existsSync(join(cwd, 'src/app/ui/core/public-api.ts')));
});

test('a second run needs --force; with force nothing is duplicated', async () => {
  const cwd = app();
  await runInit({ cwd, registry, skipInstall: true, yes: true });
  const css = read(cwd, 'src/styles.css');
  await assert.rejects(runInit({ cwd, registry, skipInstall: true, yes: true }), {
    message: 'already initialized — use --force',
  });
  const again = await runInit({ cwd, registry, skipInstall: true, yes: true, force: true });
  assert.equal(read(cwd, 'src/styles.css'), css);
  assert.deepEqual(again.written, []);
});

test('an existing tailwind .postcssrc.json is left alone', async () => {
  const cwd = app();
  const mine = '{ "plugins": { "@tailwindcss/postcss": { "base": "." } } }\n';
  writeFileSync(join(cwd, '.postcssrc.json'), mine);
  await runInit({ cwd, registry, skipInstall: true, yes: true });
  assert.equal(read(cwd, '.postcssrc.json'), mine);
});

test('the default preset code gives the same output as no preset', async () => {
  const a = app();
  const b = app();
  await runInit({ cwd: a, registry, skipInstall: true, yes: true });
  await runInit({ cwd: b, registry, skipInstall: true, yes: true, preset: encodePreset(DEFAULT_PRESET) });
  for (const f of ['components.json', 'src/styles.css', 'src/app/ui/styles/theme.css', 'src/index.html']) {
    assert.equal(read(a, f), read(b, f), f);
  }
});

test('an unknown base color fails with the options', async () => {
  await assert.rejects(runInit({ cwd: app(), registry, skipInstall: true, yes: true, baseColor: 'zinc' }), {
    message: 'unknown baseColor "zinc" (available: neutral)',
  });
});

test('--prefix acme --path src/lib/ui', async () => {
  const cwd = app();
  await runInit({ cwd, registry, skipInstall: true, yes: true, prefix: 'acme', path: 'src/lib/ui' });
  assert.ok(existsSync(join(cwd, 'src/lib/ui/styles/theme.css')));
  assert.ok(existsSync(join(cwd, 'src/lib/ui/core/public-api.ts')));
  assert.match(read(cwd, 'src/styles.css'), /@import "\.\/lib\/ui\/styles\/theme\.css";/);
  assert.equal(JSON.parse(read(cwd, 'components.json')).prefix, 'acme');
  await assert.rejects(runInit({ cwd: app(), registry, skipInstall: true, yes: true, prefix: 'Acme' }), /prefix/);
});

test('ng-objstyles: imports land in the object styles entry', async () => {
  const cwd = app('ng-objstyles');
  await runInit({ cwd, registry, skipInstall: true, yes: true });
  assert.ok(read(cwd, 'src/global.css').startsWith('@import "tailwindcss";'));
  assert.match(read(cwd, 'src/main.html'), /<body class="style-maia">/);
});

test('notes list the deps and the missing tailwind trio', async () => {
  const r = await runInit({ cwd: app(), registry, skipInstall: true, yes: true });
  const notes = r.notes.join('\n');
  for (const d of ['@angular/cdk@^22.0.0', '@lucide/angular', 'tw-animate-css', 'clsx@']) assert.ok(notes.includes(d), d);
  assert.match(notes, /npm install -D .*tailwindcss.*@tailwindcss\/postcss.*postcss/);
});

test('dry run writes nothing', async () => {
  const cwd = app();
  const before = read(cwd, 'src/styles.css');
  const r = await runInit({ cwd, registry, skipInstall: true, yes: true, dryRun: true });
  assert.ok(r.written.includes('components.json'));
  assert.ok(!existsSync(join(cwd, 'components.json')));
  assert.equal(read(cwd, 'src/styles.css'), before);
});

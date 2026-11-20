import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { runInit } from '../src/commands/init.ts';
import { DEFAULT_PRESET, FILL_PRESET, encodePreset } from '../src/preset.ts';
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
  '@import "./app/ui/styles/theme-nova.css";',
];

test('fresh ng-app: config, theme, style, imports, body class, postcss, core', async () => {
  const cwd = app();
  const userCss = read(cwd, 'src/styles.css');
  await runInit({ cwd, registry, skipInstall: true, yes: true, theme: encodePreset(FILL_PRESET) });

  assert.deepEqual(JSON.parse(read(cwd, 'components.json')), {
    $schema: 'https://ivorie.dev/schema/components.json',
    path: 'src/app/ui',
    prefix: 'iv',
    theme: 'nova',
    tailwind: { css: 'src/styles.css', baseColor: 'neutral' },
    font: 'system',
    radius: 'default',
    iconLibrary: 'lucide',
  });
  const base = item('theme-base').files[0].content;
  const vars = item('theme-neutral').cssVars;
  assert.equal(read(cwd, 'src/app/ui/styles/theme.css'), renderTheme({ base, ...vars }, { imports: false }));
  assert.equal(read(cwd, 'src/app/ui/styles/theme-nova.css'), item('style-nova').files[0].content);
  assert.equal(read(cwd, 'src/styles.css'), IMPORTS.join('\n') + '\n' + userCss);
  assert.match(read(cwd, 'src/index.html'), /<body class="theme-nova">/);
  assert.deepEqual(JSON.parse(read(cwd, '.postcssrc.json')), { plugins: { '@tailwindcss/postcss': {} } });
  assert.ok(existsSync(join(cwd, 'src/app/ui/core/public-api.ts')));
});

// Ivorie's own themes (tools/styles/own) ship like the Classic ones: a registry item each.
test('init --theme glass writes the glass theme, its import and the body class', async () => {
  const cwd = app();
  await runInit({ cwd, registry, skipInstall: true, yes: true, theme: 'glass' });
  assert.equal(JSON.parse(read(cwd, 'components.json')).theme, 'glass');
  assert.equal(read(cwd, 'src/app/ui/styles/theme-glass.css'), item('style-glass').files[0].content);
  assert.ok(read(cwd, 'src/styles.css').includes('@import "./app/ui/styles/theme-glass.css";'));
  assert.match(read(cwd, 'src/index.html'), /<body class="theme-glass">/);
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
  await runInit({ cwd: b, registry, skipInstall: true, yes: true, theme: encodePreset(DEFAULT_PRESET) });
  for (const f of ['components.json', 'src/styles.css', 'src/app/ui/styles/theme.css', 'src/index.html']) {
    assert.equal(read(a, f), read(b, f), f);
  }
});

test('an unknown base color fails with the options', async () => {
  await assert.rejects(runInit({ cwd: app(), registry, skipInstall: true, yes: true, baseColor: 'slate' }), {
    message: 'unknown baseColor "slate" (available: mauve, mist, neutral, olive, stone, taupe, zinc)',
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
  assert.match(read(cwd, 'src/main.html'), /<body class="theme-slate">/);
});

test('notes list the deps and the missing tailwind trio', async () => {
  const r = await runInit({ cwd: app(), registry, skipInstall: true, yes: true });
  const notes = r.notes.join('\n');
  for (const d of ['@angular/cdk@^22.0.0', 'tw-animate-css', 'clsx@']) assert.ok(notes.includes(d), d);
  assert.ok(!notes.includes('@lucide/angular'), 'components draw their own icons');
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

test('--base-color olive writes the olive vars', async () => {
  const cwd = app();
  await runInit({ cwd, registry, skipInstall: true, yes: true, theme: encodePreset(FILL_PRESET), baseColor: 'olive' });
  const theme = readFileSync(join(cwd, 'src/app/ui/styles/theme.css'), 'utf8');
  assert.match(theme, /--primary: oklch\(0\.228 0\.013 107\.4\);/);
});

test('--font inter --font-heading lora --radius large: config, theme, import, install note', async () => {
  const cwd = app();
  const report = await runInit({ cwd, registry, skipInstall: true, yes: true, font: 'inter', fontHeading: 'lora', radius: 'large' });
  const config = JSON.parse(read(cwd, 'components.json'));
  assert.equal(config.font, 'inter');
  assert.equal(config.fontHeading, 'lora');
  assert.equal(config.radius, 'large');
  const theme = read(cwd, 'src/app/ui/styles/theme.css');
  assert.match(theme, /--radius: 0\.875rem;/);
  assert.match(theme, /--font-sans: 'Inter Variable', sans-serif;/);
  assert.match(read(cwd, 'src/styles.css'), /@import "@fontsource-variable\/inter";\n@import "@fontsource-variable\/lora";/);
  assert.ok(report.notes.some((n) => n.includes('@fontsource-variable/inter') && n.includes('@fontsource-variable/lora')));
});

test('the default preset writes no fontHeading in components.json', async () => {
  const cwd = app();
  await runInit({ cwd, registry, skipInstall: true, yes: true });
  assert.equal('fontHeading' in JSON.parse(read(cwd, 'components.json')), false);
});

test('--icon-library tabler: copies the set, wires app.config.ts, installs @ng-icons', async () => {
  const cwd = app();
  mkdirSync(join(cwd, 'src/app'), { recursive: true });
  writeFileSync(join(cwd, 'src/app/app.config.ts'), "import { ApplicationConfig } from '@angular/core';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [],\n};\n");
  const r = await runInit({ cwd, registry, skipInstall: true, yes: true, iconLibrary: 'tabler' });
  assert.equal(JSON.parse(read(cwd, 'components.json')).iconLibrary, 'tabler');
  assert.match(read(cwd, 'src/app/ui/icons-tabler/icons.ts'), /from '\.\.\/icon\/public-api'/);
  const ts = read(cwd, 'src/app/app.config.ts');
  assert.match(ts, /import \{ COMPONENT_ICONS \} from '\.\/ui\/icons-tabler\/public-api';/);
  assert.match(ts, /providers: \[provideIvIcons\(COMPONENT_ICONS\)\]/);
  assert.ok(r.notes.some((n) => n.includes('@ng-icons/core') && n.includes('@ng-icons/tabler-icons')));
});

test('no preset: the slate theme (zinc, blue, geist, small radius, default density)', async () => {
  const cwd = app();
  await runInit({ cwd, registry, skipInstall: true, yes: true });
  const config = JSON.parse(read(cwd, 'components.json'));
  assert.deepEqual([config.theme, config.accent, config.font, config.radius], ['slate', 'blue', 'geist', 'small']);
  assert.equal(read(cwd, 'src/app/ui/styles/theme-slate.css'), item('style-slate').files[0].content);
  assert.ok(read(cwd, 'src/app/ui/styles/theme.css').includes(`--primary: ${item('theme-accent-blue').cssVars.light['--primary']};`));
  assert.match(read(cwd, 'src/index.html'), /<body class="theme-slate">/);
  assert.ok(!read(cwd, 'src/app/ui/styles/theme.css').includes('--spacing:'), 'no app-wide spacing change');
});

// A 1.1 code (style maia). Must keep working after maia became legacy.
const CODE_MAIA = 'ivp1_eyJiYXNlQ29sb3IiOiJuZXV0cmFsIiwiZm9udCI6InN5c3RlbSIsInJhZGl1cyI6ImRlZmF1bHQiLCJzdHlsZSI6Im1haWEifQ';

test('an old maia code still works and notes that maia is legacy', async () => {
  const cwd = app();
  const report = await runInit({ cwd, registry, skipInstall: true, yes: true, theme: CODE_MAIA });
  assert.equal(JSON.parse(read(cwd, 'components.json')).theme, 'maia');
  assert.ok(report.notes.includes('theme \"maia\" is legacy and leaves in 2.0'));
});

// 1.5 flags keep working until 2.0, each with a note.
test('1.5 flags: --preset, --style and --theme <accent> still work, with notes', async () => {
  const cwd = app();
  const report = await runInit({ cwd, registry, skipInstall: true, yes: true, preset: 'mira', style: 'nova', theme: 'rose' });
  const config = JSON.parse(read(cwd, 'components.json'));
  assert.deepEqual([config.theme, config.accent, config.font], ['nova', 'rose', 'ibm-plex-sans']);
  assert.ok(existsSync(join(cwd, 'src/app/ui/styles/theme-nova.css')));
  assert.ok(report.notes.includes('--preset is now --theme; --preset leaves in 2.0'));
  assert.ok(report.notes.includes('--style leaves in 2.0; use --theme'));
  assert.ok(report.notes.includes('--theme rose is an accent: use --accent rose; the old meaning leaves in 2.0'));
});

test('--theme and --accent: a theme with another accent; graphite, the 1.5 name, gives slate', async () => {
  const cwd = app();
  const report = await runInit({ cwd, registry, skipInstall: true, yes: true, theme: 'graphite', accent: 'blue' });
  const config = JSON.parse(read(cwd, 'components.json'));
  assert.deepEqual([config.theme, config.accent, config.font], ['slate', 'blue', 'geist']);
  assert.ok(!report.notes.some((n) => n.includes('leaves in 2.0')));
});

test('--style graphite (1.5 flag, 1.5 name) gives slate, with the --style note', async () => {
  const cwd = app();
  const report = await runInit({ cwd, registry, skipInstall: true, yes: true, style: 'graphite' });
  assert.equal(JSON.parse(read(cwd, 'components.json')).theme, 'slate');
  assert.ok(report.notes.includes('--style leaves in 2.0; use --theme'));
});

test('--theme base (1.5: no accent) gives the default theme with no accent', async () => {
  const cwd = app();
  const report = await runInit({ cwd, registry, skipInstall: true, yes: true, theme: 'base' });
  const config = JSON.parse(read(cwd, 'components.json'));
  assert.equal(config.theme, 'slate');
  assert.equal(config.accent, undefined);
  assert.ok(report.notes.includes('--theme base is an accent: use --accent base; the old meaning leaves in 2.0'));
});

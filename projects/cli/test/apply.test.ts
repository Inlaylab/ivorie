import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { runApply } from '../src/commands/apply.ts';
import { runInit } from '../src/commands/init.ts';
import { FILL_PRESET, decodePreset, encodePreset } from '../src/preset.ts';
import { PRESET_GOLDEN } from './preset.fixture.ts';

const temps: string[] = [];
let registry: string;
before(() => {
  registry = mkdtempSync(join(tmpdir(), 'ivorie-reg-'));
  temps.push(registry);
  build(registry);
});
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

async function initApp(theme?: string) {
  const cwd = mkdtempSync(join(tmpdir(), 'ivorie-apply-'));
  temps.push(cwd);
  cpSync('projects/cli/test/fixtures/ng-app', cwd, { recursive: true });
  await runInit({ cwd, registry, skipInstall: true, yes: true, ...(theme ? { theme } : {}) });
  return cwd;
}
const read = (dir: string, file: string) => readFileSync(join(dir, file), 'utf8');
const opts = (cwd: string) => ({ cwd, registry, skipInstall: true });

test('apply the golden code: config, theme, theme file, imports, body class', async () => {
  const cwd = await initApp();
  const report = await runApply(PRESET_GOLDEN.code, opts(cwd));
  const config = JSON.parse(read(cwd, 'components.json'));
  assert.equal(config.theme, 'nova');
  assert.equal(config.tailwind.baseColor, 'olive');
  assert.equal(config.font, 'inter');
  assert.equal(config.fontHeading, 'lora');
  assert.equal(config.radius, 'large');
  const theme = read(cwd, 'src/app/ui/styles/theme.css');
  assert.match(theme, /--primary: oklch\(0\.228 0\.013 107\.4\);/);
  assert.match(theme, /--radius: 0\.875rem;/);
  assert.match(read(cwd, 'src/app/ui/styles/theme-nova.css'), /:is\(\.theme-nova, \.style-nova\)/);
  const css = read(cwd, 'src/styles.css');
  assert.match(css, /@import "\.\/app\/ui\/styles\/theme-nova\.css";/);
  assert.doesNotMatch(css, /(style|theme)-maia\.css/);
  assert.match(css, /@import "@fontsource-variable\/inter";/);
  assert.match(css, /@import "@fontsource-variable\/lora";/);
  assert.match(read(cwd, 'src/index.html'), /<body class="theme-nova">/);
  const back = await runApply(encodePreset({ ...PRESET_GOLDEN.preset, theme: 'maia' }), opts(cwd));
  assert.ok(back.notes.some((n) => n.includes('theme-nova.css is no longer used')));
  assert.ok(report.notes.some((n) => n.includes('@fontsource-variable/inter')));
});

test('a second apply changes nothing', async () => {
  const cwd = await initApp();
  await runApply(PRESET_GOLDEN.code, opts(cwd));
  const again = await runApply(PRESET_GOLDEN.code, opts(cwd));
  assert.deepEqual(again.written, []);
});

test('apply a system-font preset after the golden code drops the font imports', async () => {
  const cwd = await initApp();
  await runApply(PRESET_GOLDEN.code, opts(cwd));
  await runApply(encodePreset(FILL_PRESET), opts(cwd));
  const css = read(cwd, 'src/styles.css');
  assert.doesNotMatch(css, /fontsource/);
  assert.match(css, /theme-nova\.css/);
  assert.equal('fontHeading' in JSON.parse(read(cwd, 'components.json')), false);
});

test('no theme import in styles.css: adds it and notes it', async () => {
  const cwd = await initApp();
  writeFileSync(join(cwd, 'src/styles.css'), '@import "tailwindcss";\n');
  const report = await runApply(PRESET_GOLDEN.code, opts(cwd));
  assert.match(read(cwd, 'src/styles.css'), /theme-nova\.css/);
  assert.ok(report.notes.some((n) => n.startsWith('no theme import found')));
});

test('apply keeps a user import that only looks like a theme', async () => {
  const cwd = await initApp();
  const own = '@import "./styles/theme-overrides.css";';
  writeFileSync(join(cwd, 'src/styles.css'), `${read(cwd, 'src/styles.css')}${own}\n`);
  await runApply('glass', opts(cwd));
  const css = read(cwd, 'src/styles.css');
  assert.ok(css.includes(own), 'own import kept');
  assert.match(css, /theme-glass\.css/);
  assert.doesNotMatch(css, /theme-slate\.css/);
});

test('unknown preset throws and writes nothing', async () => {
  const cwd = await initApp();
  const before = read(cwd, 'components.json');
  await assert.rejects(runApply('nope', opts(cwd)), /^Error: unknown theme "nope" \(available: bento, clay, glass, /);
  assert.equal(read(cwd, 'components.json'), before);
});

test('no components.json throws', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ivorie-apply-'));
  temps.push(cwd);
  await assert.rejects(runApply('default', opts(cwd)), { message: 'components.json not found — run "ivorie init"' });
});

test('apply a tabler code: copies the set, wires app.config.ts, notes migrate icons; again changes nothing', async () => {
  const cwd = await initApp();
  writeFileSync(join(cwd, 'src/app/app.config.ts'), 'export const appConfig = {\n  providers: [],\n};\n');
  const code = encodePreset({ ...PRESET_GOLDEN.preset, iconLibrary: 'tabler' });
  const report = await runApply(code, opts(cwd));
  assert.equal(JSON.parse(read(cwd, 'components.json')).iconLibrary, 'tabler');
  assert.match(read(cwd, 'src/app/ui/icons-tabler/icons.ts'), /COMPONENT_ICONS/);
  assert.match(read(cwd, 'src/app/app.config.ts'), /providers: \[provideIvIcons\(COMPONENT_ICONS\)\]/);
  assert.ok(report.notes.some((n) => n.includes('migrate icons --from lucide --to tabler')));
  assert.deepEqual((await runApply(code, opts(cwd))).written, []);
  await runApply(PRESET_GOLDEN.code, opts(cwd));
  assert.doesNotMatch(read(cwd, 'src/app/app.config.ts'), /provideIvIcons/);
});

test('a dial the theme does not take: one note, nothing written for it', async () => {
  const cwd = await initApp();
  const report = await runApply(encodePreset({ ...PRESET_GOLDEN.preset, rim: 'strong' }), opts(cwd));
  assert.deepEqual(report.notes.filter((n) => n.startsWith('dial ')), ['dial "rim" does nothing on theme "nova"']);
  assert.doesNotMatch(read(cwd, 'src/app/ui/styles/theme.css'), /--iv-rim/);
});

test('apply a theme by name; an unknown name lists the themes', async () => {
  const cwd = await initApp();
  await runApply('mono', opts(cwd));
  assert.match(read(cwd, 'src/app/ui/styles/theme-mono.css'), /:is\(\.theme-mono, \.style-mono\)/);
  await assert.rejects(runApply('frost', opts(cwd)), /unknown theme "frost" \(available: .*\bglass\b.*\bsera\b/);
});

test('an old Mist-like code still applies exactly as encoded', async () => {
  const cwd = await initApp();
  await runApply(encodePreset({ ...FILL_PRESET, theme: 'glass', baseColor: 'mist', accent: 'teal', ambient: 'vivid' }), opts(cwd));
  assert.match(read(cwd, 'src/app/ui/styles/theme.css'), /--iv-ambient: 2\.5;/);
  assert.equal(JSON.parse(read(cwd, 'components.json')).accent, 'teal');
});

test('a 1.5 app: components.json style/theme keys, style-<name>.css import and class move to the theme names', async () => {
  // 1.5 apps started on glass, its default then.
  const cwd = await initApp('glass');
  const config = JSON.parse(read(cwd, 'components.json'));
  const { theme, ...rest } = config;
  writeFileSync(join(cwd, 'components.json'), JSON.stringify({ ...rest, style: theme, theme: 'rose' }, null, 2));
  writeFileSync(join(cwd, 'src/styles.css'), read(cwd, 'src/styles.css').replace('theme-glass.css', 'style-glass.css'));
  writeFileSync(join(cwd, 'src/app/ui/styles/style-glass.css'), read(cwd, 'src/app/ui/styles/theme-glass.css'));
  writeFileSync(join(cwd, 'src/index.html'), read(cwd, 'src/index.html').replace('theme-glass', 'style-glass'));
  const report = await runApply('mira', opts(cwd));
  const next = JSON.parse(read(cwd, 'components.json'));
  assert.equal(next.theme, 'mira');
  assert.equal(next.style, undefined);
  assert.match(read(cwd, 'src/styles.css'), /theme-mira\.css/);
  assert.doesNotMatch(read(cwd, 'src/styles.css'), /style-glass\.css/);
  assert.match(read(cwd, 'src/index.html'), /<body class="theme-mira">/);
  assert.ok(report.notes.includes('style-glass.css is no longer used; delete it if you did not change it'));
});

test('dials are kept in components.json "preset" and survive apply <theme>', async () => {
  const cwd = await initApp();
  assert.equal(JSON.parse(read(cwd, 'components.json')).preset, undefined, 'no dials: no preset field');
  await runApply(encodePreset({ ...PRESET_GOLDEN.preset, theme: 'slate', density: 'roomy', rim: 'strong' }), opts(cwd));
  const saved = JSON.parse(read(cwd, 'components.json')).preset;
  assert.deepEqual([decodePreset(saved).density, decodePreset(saved).rim], ['roomy', 'strong']);

  const report = await runApply('glass', opts(cwd));
  assert.match(read(cwd, 'src/app/ui/styles/theme.css'), /--spacing: 0\.3rem;/);
  assert.match(read(cwd, 'src/app/ui/styles/theme.css'), /--iv-rim: 2\.2;/);
  assert.ok(!report.notes.some((n) => n.startsWith('dial ')), report.notes.join('\n'));

  const toNova = await runApply('nova', opts(cwd));
  assert.match(read(cwd, 'src/app/ui/styles/theme.css'), /--spacing: 0\.3rem;/);
  assert.ok(toNova.notes.includes('dial "rim" does nothing on theme "nova"'), toNova.notes.join('\n'));
});

test("apply mono then apply slate: mono's snappy motion does not follow (not a user dial)", async () => {
  const cwd = await initApp();
  await runApply('mono', opts(cwd));
  assert.equal(JSON.parse(read(cwd, 'components.json')).preset, undefined);
  await runApply('slate', opts(cwd));
  assert.doesNotMatch(read(cwd, 'src/app/ui/styles/theme.css'), /--default-transition-duration/);
});

test('a broken components.json "preset" does not stop apply: one note, the dials are dropped', async () => {
  const cwd = await initApp();
  const config = JSON.parse(read(cwd, 'components.json'));
  writeFileSync(join(cwd, 'components.json'), JSON.stringify({ ...config, preset: 'ivp1_broken!' }, null, 2));
  const report = await runApply('glass', opts(cwd));
  assert.ok(report.notes.includes('components.json "preset" is not a valid ivp1_ code: saved dials were not kept'), report.notes.join('\n'));
  assert.equal(JSON.parse(read(cwd, 'components.json')).theme, 'glass');
});

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../../tools/registry/build.ts';
import { runApply } from '../src/commands/apply.ts';
import { runInit } from '../src/commands/init.ts';
import { PRESET_GOLDEN } from './preset.fixture.ts';

const temps: string[] = [];
let registry: string;
before(() => {
  registry = mkdtempSync(join(tmpdir(), 'ivorie-reg-'));
  temps.push(registry);
  build(registry);
});
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

async function initApp() {
  const cwd = mkdtempSync(join(tmpdir(), 'ivorie-apply-'));
  temps.push(cwd);
  cpSync('projects/cli/test/fixtures/ng-app', cwd, { recursive: true });
  await runInit({ cwd, registry, skipInstall: true, yes: true });
  return cwd;
}
const read = (dir: string, file: string) => readFileSync(join(dir, file), 'utf8');
const opts = (cwd: string) => ({ cwd, registry, skipInstall: true });

test('apply the golden code: config, theme, style file, imports, body class', async () => {
  const cwd = await initApp();
  const report = await runApply(PRESET_GOLDEN.code, opts(cwd));
  const config = JSON.parse(read(cwd, 'components.json'));
  assert.equal(config.style, 'nova');
  assert.equal(config.tailwind.baseColor, 'olive');
  assert.equal(config.font, 'inter');
  assert.equal(config.fontHeading, 'lora');
  assert.equal(config.radius, 'large');
  const theme = read(cwd, 'src/app/ui/styles/theme.css');
  assert.match(theme, /--primary: oklch\(0\.228 0\.013 107\.4\);/);
  assert.match(theme, /--radius: 0\.875rem;/);
  assert.match(read(cwd, 'src/app/ui/styles/style-nova.css'), /\.style-nova/);
  const css = read(cwd, 'src/styles.css');
  assert.match(css, /@import "\.\/app\/ui\/styles\/style-nova\.css";/);
  assert.doesNotMatch(css, /style-maia\.css/);
  assert.match(css, /@import "@fontsource-variable\/inter";/);
  assert.match(css, /@import "@fontsource-variable\/lora";/);
  assert.match(read(cwd, 'src/index.html'), /<body class="style-nova">/);
  assert.ok(report.notes.some((n) => n.includes('style-maia.css is no longer used')));
  assert.ok(report.notes.some((n) => n.includes('@fontsource-variable/inter')));
});

test('a second apply changes nothing', async () => {
  const cwd = await initApp();
  await runApply(PRESET_GOLDEN.code, opts(cwd));
  const again = await runApply(PRESET_GOLDEN.code, opts(cwd));
  assert.deepEqual(again.written, []);
});

test('apply default after the golden code drops the font imports', async () => {
  const cwd = await initApp();
  await runApply(PRESET_GOLDEN.code, opts(cwd));
  await runApply('default', opts(cwd));
  const css = read(cwd, 'src/styles.css');
  assert.doesNotMatch(css, /fontsource|style-nova/);
  assert.match(css, /style-maia\.css/);
  assert.equal('fontHeading' in JSON.parse(read(cwd, 'components.json')), false);
});

test('no style import in styles.css: adds it and notes it', async () => {
  const cwd = await initApp();
  writeFileSync(join(cwd, 'src/styles.css'), '@import "tailwindcss";\n');
  const report = await runApply(PRESET_GOLDEN.code, opts(cwd));
  assert.match(read(cwd, 'src/styles.css'), /style-nova\.css/);
  assert.ok(report.notes.some((n) => n.startsWith('no style import found')));
});

test('unknown preset throws and writes nothing', async () => {
  const cwd = await initApp();
  const before = read(cwd, 'components.json');
  await assert.rejects(runApply('nope', opts(cwd)), { message: 'unknown preset "nope"' });
  assert.equal(read(cwd, 'components.json'), before);
});

test('no components.json throws', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ivorie-apply-'));
  temps.push(cwd);
  await assert.rejects(runApply('default', opts(cwd)), { message: 'components.json not found — run "ivorie init"' });
});

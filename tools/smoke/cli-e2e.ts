// CLI end-to-end smoke (network): fresh `ng new --ssr` apps. One set up with `ivorie init + add` and one
// with the npm package must build and render the same button classes and CSS rules. A third, made with
// `ivorie init --preset <playground code>`, must get that look, and `ivorie apply default` must undo it.
// Usage: npm run smoke:cli
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PRESET_GOLDEN } from '../../projects/cli/test/preset.fixture.ts';

const ROOT = process.cwd();
const SMOKE = resolve('.smoke');
const work = join(tmpdir(), `ivorie-e2e-${Date.now()}`);
const failures: string[] = [];
const warnings: string[] = [];

const run = (cmd: string, cwd = ROOT) => execSync(cmd, { cwd, stdio: 'inherit' });

function pack(dir: string): string {
  const out = execSync(`npm pack ${dir} --pack-destination "${SMOKE}" --json`, { encoding: 'utf8' });
  return join(SMOKE, JSON.parse(out)[0].filename);
}

const APP_TS = (from: string) => `import { Component, TemplateRef, inject, viewChild } from '@angular/core';
import { IvButton } from '${from}/button${from.startsWith('.') ? '/public-api' : ''}';
import { IV_DIALOG_IMPORTS, IvDialog } from '${from}/dialog${from.startsWith('.') ? '/public-api' : ''}';

@Component({
  selector: 'app-root',
  imports: [IvButton, IV_DIALOG_IMPORTS],
  templateUrl: './app.html',
})
export class App {
  private readonly dialog = inject(IvDialog);
  private readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');

  open() {
    this.dialog.open(this.tpl());
  }
}
`;

const APP_HTML = `<main class="flex gap-2 p-8">
  <button ivButton (click)="open()">Open</button>
  <button ivButton variant="outline">Outline</button>
  <button ivButton variant="destructive">Delete</button>
</main>
<ng-template #tpl>
  <iv-dialog-header><iv-dialog-title>Hello</iv-dialog-title></iv-dialog-header>
</ng-template>
`;

function newApp(name: string, cliMajor: string) {
  run(`npx -y @angular/cli@${cliMajor} new ${name} --ssr --style=css --skip-git --skip-tests --defaults`, work);
  return join(work, name);
}

function writeApp(app: string, from: string) {
  writeFileSync(join(app, 'src/app/app.ts'), APP_TS(from));
  writeFileSync(join(app, 'src/app/app.html'), APP_HTML);
}

const browserDir = (app: string, name: string) => join(app, 'dist', name, 'browser');

function buttonClasses(app: string, name: string): string[] {
  const html = readFileSync(join(browserDir(app, name), 'index.html'), 'utf8');
  return [...html.matchAll(/<button\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => tag.includes('data-slot="button"'))
    .map((tag) => /\sclass="([^"]*)"/.exec(tag)?.[1] ?? '');
}

function stylesCss(app: string, name: string): string {
  const dir = browserDir(app, name);
  const file = readdirSync(dir).find((f) => /^styles-.*\.css$/.test(f));
  if (!file) throw new Error(`${name}: no styles-*.css`);
  return readFileSync(join(dir, file), 'utf8');
}

function cssRules(app: string, name: string): string[] {
  const css = stylesCss(app, name);
  return [...css.matchAll(/\.cn-button(?:-variant-destructive)?\{[^}]*\}/g)].map((m) => m[0]);
}

let ok = false;
try {
  rmSync(SMOKE, { recursive: true, force: true });
  mkdirSync(SMOKE);
  mkdirSync(work, { recursive: true });

  run('node tools/registry/build.ts');
  run('node tools/cli/build.ts');
  const cliTgz = pack('./dist/cli');
  run('npx ng build ui');
  const uiTgz = pack('./dist/ui');
  const cliMajor = /\d+/.exec(JSON.parse(readFileSync('package.json', 'utf8')).devDependencies['@angular/cli'])![0];

  // 1. CLI: init + add.
  const cliApp = newApp('cli-app', cliMajor);
  run(`npm i -D "${cliTgz}"`, cliApp);
  run('npx ivorie init --yes', cliApp);
  run('npx ivorie add button dialog', cliApp);
  writeApp(cliApp, './ui');

  // 2. npm package, following installation.md.
  const npmApp = newApp('npm-app', cliMajor);
  run(`npm i "${uiTgz}" @angular/cdk@^${cliMajor}`, npmApp);
  run('npm i -D tailwindcss @tailwindcss/postcss tw-animate-css', npmApp);
  writeFileSync(join(npmApp, '.postcssrc.json'), '{ "plugins": { "@tailwindcss/postcss": {} } }\n');
  writeFileSync(
    join(npmApp, 'src/styles.css'),
    '@import "@inlaylab/ivorie/styles/theme.css";\n@import "@inlaylab/ivorie/styles/style-nova.css";\n',
  );
  const index = join(npmApp, 'src/index.html');
  writeFileSync(index, readFileSync(index, 'utf8').replace('<body>', '<body class="style-nova">'));
  writeApp(npmApp, '@inlaylab/ivorie');

  run('npx ng build', cliApp);
  run('npx ng build', npmApp);

  const [a, b] = [buttonClasses(cliApp, 'cli-app'), buttonClasses(npmApp, 'npm-app')];
  if (a.length !== 3) failures.push(`cli-app: expected 3 buttons, found ${a.length}`);
  if (JSON.stringify(a) !== JSON.stringify(b)) failures.push(`button classes differ:\n  cli: ${a.join(' | ')}\n  npm: ${b.join(' | ')}`);
  const [ca, cb] = [cssRules(cliApp, 'cli-app'), cssRules(npmApp, 'npm-app')];
  if (!ca.length) failures.push('cli-app: no .cn-button rules in CSS');
  if (JSON.stringify(ca) !== JSON.stringify(cb)) failures.push(`.cn-button rules differ:\n  cli: ${ca.join('\n')}\n  npm: ${cb.join('\n')}`);

  // 3. A playground preset in a fresh app gives that look; apply changes it back.
  const presetApp = newApp('preset-app', cliMajor);
  run(`npm i -D "${cliTgz}"`, presetApp);
  run(`npx ivorie init --yes --preset ${PRESET_GOLDEN.code}`, presetApp);
  run('npx ivorie add button dialog', presetApp);
  writeApp(presetApp, './ui');
  run('npx ng build', presetApp);
  const look = (expect: Record<string, RegExp>, step: string) => {
    const css = stylesCss(presetApp, 'preset-app');
    const html = readFileSync(join(browserDir(presetApp, 'preset-app'), 'index.html'), 'utf8');
    for (const [what, re] of Object.entries(expect)) {
      if (!re.test(what === 'body' ? html : css)) failures.push(`preset-app ${step}: ${what} missing (${re})`);
    }
  };
  // Olive light --primary is oklch(0.228 0.013 107.4); minifiers drop the leading 0.
  look(
    {
      primary: /--primary:\s*oklch\(0?\.228 0?\.013 107\.4\)/,
      radius: /--radius:\s*\.875rem/,
      font: /Inter Variable/,
      heading: /Lora Variable/,
      style: /\.style-nova/,
      body: /<body[^>]*class="[^"]*style-nova/,
    },
    'init --preset',
  );
  run('npx ivorie apply default', presetApp);
  run('npx ng build', presetApp);
  look({ primary: /--primary:\s*oklch\(0?\.205 0 0\)/, style: /\.style-nova/, body: /<body[^>]*class="[^"]*style-nova/ }, 'apply default');

  // 4. A tabler app: the set is copied, wired into app.config.ts and the app builds with @ng-icons installed.
  const tablerApp = newApp('tabler-app', cliMajor);
  run(`npm i -D "${cliTgz}"`, tablerApp);
  run('npx ivorie init --yes --icon-library tabler', tablerApp);
  run('npx ivorie add button dialog', tablerApp);
  writeApp(tablerApp, './ui');
  run('npx ng build', tablerApp);
  const config = readFileSync(join(tablerApp, 'src/app/app.config.ts'), 'utf8');
  if (!config.includes('provideIvIcons(COMPONENT_ICONS)')) failures.push('tabler-app: app.config.ts has no provideIvIcons(COMPONENT_ICONS)');
  if (!existsSync(join(tablerApp, 'src/app/ui/icons-tabler/icons.ts'))) failures.push('tabler-app: icons-tabler was not copied');
  if (!existsSync(join(tablerApp, 'node_modules/@ng-icons/tabler-icons'))) failures.push('tabler-app: @ng-icons/tabler-icons was not installed');

  // 5. shadcn compat: the registry items are shadcn items.
  try {
    run(`npx -y shadcn@latest add "${resolve('dist/registry/r/badge.json')}" --yes`, npmApp);
    if (!existsSync(join(npmApp, 'src/app/ui/badge/badge.ts'))) warnings.push('shadcn add ran but src/app/ui/badge/badge.ts is missing');
  } catch (err) {
    warnings.push(`shadcn add failed: ${(err as Error).message.split('\n')[0]}`);
  }
  ok = failures.length === 0;
} catch (err) {
  failures.push((err as Error).message.split('\n')[0]);
}

warnings.forEach((w) => console.warn(`WARN smoke-cli: ${w}`));
if (ok) {
  rmSync(work, { recursive: true, force: true });
  console.log('PASS smoke-cli');
} else {
  console.error(`FAIL smoke-cli:\n${failures.map((f) => `  ${f}`).join('\n')}\n  kept: ${work}`);
  process.exit(1);
}

// CLI end-to-end smoke (network): two fresh `ng new --ssr` apps, one set up with `ivorie init + add`,
// one with the npm package. Both must build and render the same button classes and CSS rules.
// Usage: npm run smoke:cli
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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

function cssRules(app: string, name: string): string[] {
  const dir = browserDir(app, name);
  const file = readdirSync(dir).find((f) => /^styles-.*\.css$/.test(f));
  if (!file) throw new Error(`${name}: no styles-*.css`);
  const css = readFileSync(join(dir, file), 'utf8');
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
  run(`npm i "${uiTgz}" @angular/cdk@^${cliMajor} @lucide/angular`, npmApp);
  run('npm i -D tailwindcss @tailwindcss/postcss tw-animate-css', npmApp);
  writeFileSync(join(npmApp, '.postcssrc.json'), '{ "plugins": { "@tailwindcss/postcss": {} } }\n');
  writeFileSync(
    join(npmApp, 'src/styles.css'),
    '@import "@inlaylab/ivorie/styles/theme.css";\n@import "@inlaylab/ivorie/styles/style-maia.css";\n',
  );
  const index = join(npmApp, 'src/index.html');
  writeFileSync(index, readFileSync(index, 'utf8').replace('<body>', '<body class="style-maia">'));
  writeApp(npmApp, '@inlaylab/ivorie');

  run('npx ng build', cliApp);
  run('npx ng build', npmApp);

  const [a, b] = [buttonClasses(cliApp, 'cli-app'), buttonClasses(npmApp, 'npm-app')];
  if (a.length !== 3) failures.push(`cli-app: expected 3 buttons, found ${a.length}`);
  if (JSON.stringify(a) !== JSON.stringify(b)) failures.push(`button classes differ:\n  cli: ${a.join(' | ')}\n  npm: ${b.join(' | ')}`);
  const [ca, cb] = [cssRules(cliApp, 'cli-app'), cssRules(npmApp, 'npm-app')];
  if (!ca.length) failures.push('cli-app: no .cn-button rules in CSS');
  if (JSON.stringify(ca) !== JSON.stringify(cb)) failures.push(`.cn-button rules differ:\n  cli: ${ca.join('\n')}\n  npm: ${cb.join('\n')}`);

  // 3. shadcn compat: the registry items are shadcn items.
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

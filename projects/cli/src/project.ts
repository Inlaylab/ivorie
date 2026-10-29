// Finds the Angular app in a workspace: its styles file, index.html, package manager and Angular major.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Project {
  root: string;
  name: string;
  sourceRoot: string;
  stylesFile: string;
  indexHtml: string;
  pm: 'npm' | 'pnpm' | 'yarn' | 'bun';
  angularMajor: number | null;
  deps: Set<string>;
}

const MIN_ANGULAR = 22;
const LOCKFILES: [string, Project['pm']][] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
];

/** JSON with // and /* *\/ comments (angular.json and tsconfig allow them). */
export function readJsonc(file: string): any {
  const text = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  // Drop comments outside strings.
  const clean = text.replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m, str) => str ?? '');
  return JSON.parse(clean);
}

type Asset = string | { input: string };
const inputOf = (a: Asset | undefined) => (typeof a === 'string' ? a : a?.input);

export function detectProject(root: string, opts: { project?: string } = {}): Project {
  const ngFile = join(root, 'angular.json');
  if (!existsSync(ngFile)) throw new Error(`angular.json not found in ${root} — run this in an Angular workspace`);
  const ng = readJsonc(ngFile);
  const apps = Object.entries<any>(ng.projects ?? {}).filter(([, p]) => p.projectType === 'application');
  if (!apps.length) throw new Error('angular.json has no application project');

  let entry: [string, any] | undefined;
  if (opts.project) {
    entry = apps.find(([name]) => name === opts.project);
    if (!entry) throw new Error(`no app "${opts.project}" (apps: ${apps.map(([n]) => n).join(', ')})`);
  } else if (apps.length > 1) {
    throw new Error(`several apps: ${apps.map(([n]) => n).join(', ')} — use --project`);
  } else {
    entry = apps[0];
  }
  const [name, app] = entry;

  const prefix = app.root ? `${app.root.replace(/\/$/, '')}/` : '';
  const sourceRoot: string = app.sourceRoot ?? `${prefix}src`;
  const options = (app.architect ?? app.targets)?.build?.options ?? {};
  const styles: Asset[] = options.styles ?? [];
  const css = styles.map(inputOf).find((s) => s && /\.css$/.test(s));
  const stylesFile = css ?? `${sourceRoot}/styles.css`;
  const indexHtml = inputOf(options.index) ?? `${sourceRoot}/index.html`;

  const pkgFile = join(root, 'package.json');
  const pkg = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile, 'utf8')) : {};
  const deps = new Set<string>([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
  const range: string | undefined = pkg.dependencies?.['@angular/core'] ?? pkg.devDependencies?.['@angular/core'];
  const major = range ? Number(/\d+/.exec(range)?.[0]) : NaN;
  const angularMajor = Number.isFinite(major) ? major : null;
  if (angularMajor === null) {
    console.warn(`warning: could not read the @angular/core version (${range ?? 'missing'}); continuing`);
  } else if (angularMajor < MIN_ANGULAR) {
    throw new Error(`Angular ${MIN_ANGULAR} or newer is required (found ${angularMajor})`);
  }

  const pm = LOCKFILES.find(([lock]) => existsSync(join(root, lock)))?.[1] ?? 'npm';
  return { root, name, sourceRoot, stylesFile, indexHtml, pm, angularMajor, deps };
}

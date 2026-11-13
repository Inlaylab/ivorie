// Reads the library entries in projects/ui and turns them into registry item data.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface EntryFile {
  name: string;
  content: string;
}
export interface Entry {
  name: string;
  dir: string;
  files: EntryFile[];
}

const UI = 'projects/ui';
const SKIP = new Set(['src', 'styles', 'testing']);
// Never listed as deps: every Angular app has them.
const BUILT_IN = /^(@angular\/(core|common|forms|router|platform-browser)|rxjs|tslib)$/;

function readEntry(name: string, dir: string): Entry {
  const files = readdirSync(dir)
    .filter((f) => /\.(ts|html)$/.test(f) && !f.endsWith('.spec.ts'))
    .sort()
    .map((f) => ({ name: f, content: readFileSync(join(dir, f), 'utf8').replace(/\r\n/g, '\n') }));
  return { name, dir, files };
}

/** Every entry with a public-api.ts, plus extras/select-picker (as `select-picker`) and icons/<lib> (as `icons-<lib>`), sorted. */
export function listEntries(root = UI): Entry[] {
  const top = readdirSync(root)
    .filter((d) => !SKIP.has(d) && existsSync(join(root, d, 'public-api.ts')))
    .map((d) => readEntry(d, join(root, d)));
  const extras = readdirSync(join(root, 'extras'))
    .filter((d) => existsSync(join(root, 'extras', d, 'public-api.ts')))
    .map((d) => readEntry(d, join(root, 'extras', d)));
  const icons = readdirSync(join(root, 'icons'))
    .filter((d) => existsSync(join(root, 'icons', d, 'public-api.ts')))
    .map((d) => readEntry(`icons-${d}`, join(root, 'icons', d)));
  return [...top, ...extras, ...icons].sort((a, b) => a.name.localeCompare(b.name));
}

/** `@inlaylab/ivorie/<x>` and `@inlaylab/ivorie/extras/<x>` → `../<x>/public-api` (copied folders are siblings). */
export function rewriteImports(content: string): string {
  return content.replace(/'@inlaylab\/ivorie\/(?:extras\/)?([a-z-]+)'/g, "'../$1/public-api'");
}

/** `>=X.0.0 <X+1.0.0` → `^X.0.0`; other ranges stay as written. */
export function normalizeRange(range: string): string {
  const m = /^>=(\d+)\.0\.0 <(\d+)\.0\.0$/.exec(range.trim());
  return m && Number(m[2]) === Number(m[1]) + 1 ? `^${m[1]}.0.0` : range;
}

const imports = (e: Entry) =>
  e.files.flatMap((f) => [...f.content.matchAll(/from '([^'.][^']*)'/g)].map((m) => m[1]));

const pkgOf = (spec: string) => spec.split('/').slice(0, spec.startsWith('@') ? 2 : 1).join('/');

let ranges: Record<string, string> | undefined;
function rangeOf(pkg: string): string {
  if (!ranges) {
    const ui = JSON.parse(readFileSync(join(UI, 'package.json'), 'utf8'));
    // Blocks also use app packages (@ng-icons/*) that only the workspace root lists.
    const root = JSON.parse(readFileSync('package.json', 'utf8'));
    ranges = { ...root.devDependencies, ...root.dependencies, ...ui.peerDependencies, ...ui.dependencies };
  }
  const range = ranges![pkg];
  if (!range) throw new Error(`registry: ${pkg} is imported but not in projects/ui/package.json or package.json`);
  return normalizeRange(range);
}

const BLOCKS = 'projects/blocks';

/** Every block: a folder in projects/blocks with `<name>/<name>.ts`. Files are read recursively, specs left out. */
export function listBlocks(root = BLOCKS): Entry[] {
  const read = (dir: string, rel = ''): EntryFile[] =>
    readdirSync(join(dir, rel), { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((d) => {
        const path = rel ? `${rel}/${d.name}` : d.name;
        if (d.isDirectory()) return read(dir, path);
        if (!/\.(ts|html)$/.test(d.name) || d.name.endsWith('.spec.ts')) return [];
        return [{ name: path, content: readFileSync(join(dir, path), 'utf8').replace(/\r\n/g, '\n') }];
      });
  return readdirSync(root)
    .filter((d) => existsSync(join(root, d, `${d}.ts`)))
    .sort()
    .map((d) => ({ name: d, dir: join(root, d), files: read(join(root, d)) }));
}

/** `export const meta = { title: '…', description: '…' }` from a block's page file. */
export function blockMeta(e: Entry): { title: string; description: string } {
  const page = e.files.find((f) => f.name === `${e.name}.ts`)!.content;
  const title = /title: '([^']+)'/.exec(page)?.[1];
  const description = /description: '([^']+)'/.exec(page)?.[1];
  if (!title || !description) throw new Error(`registry: ${e.name}.ts needs export const meta = { title, description }`);
  return { title, description };
}

/** npm deps as `pkg@range`, sorted. */
export function collectDeps(e: Entry): string[] {
  const pkgs = new Set(
    imports(e)
      .filter((s) => !s.startsWith('@inlaylab/ivorie'))
      .map(pkgOf)
      .filter((p) => !BUILT_IN.test(p)),
  );
  return [...pkgs].sort().map((p) => `${p}@${rangeOf(p)}`);
}

/** `@types/<pkg>` for each npm dep whose types the workspace root installs (d3 ships none), as `@types/pkg@range`, sorted. */
export function collectDevDeps(e: Entry): string[] {
  const root = JSON.parse(readFileSync('package.json', 'utf8')).devDependencies ?? {};
  return collectDeps(e)
    .map((d) => `@types/${packageOf(d).replace(/^@([^/]+)\//, '$1__')}`)
    .filter((t) => root[t])
    .map((t) => `${t}@${normalizeRange(root[t])}`)
    .sort();
}

/** `@scope/pkg@^1.0.0` → `@scope/pkg`. */
const packageOf = (dep: string) => dep.replace(/(?<=.)@[^@/]*$/, '');

/** Other registry items this entry imports, sorted. */
export function registryDeps(e: Entry): string[] {
  const names = imports(e)
    .map((s) => /^@inlaylab\/ivorie\/(?:extras\/)?([a-z-]+)$/.exec(s)?.[1])
    .filter((n): n is string => !!n && n !== e.name);
  return [...new Set(names)].sort();
}

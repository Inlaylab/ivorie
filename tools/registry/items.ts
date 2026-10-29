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

/** Every entry with a public-api.ts, plus extras/select-picker (as `select-picker`), sorted. */
export function listEntries(root = UI): Entry[] {
  const top = readdirSync(root)
    .filter((d) => !SKIP.has(d) && existsSync(join(root, d, 'public-api.ts')))
    .map((d) => readEntry(d, join(root, d)));
  const extras = readdirSync(join(root, 'extras'))
    .filter((d) => existsSync(join(root, 'extras', d, 'public-api.ts')))
    .map((d) => readEntry(d, join(root, 'extras', d)));
  return [...top, ...extras].sort((a, b) => a.name.localeCompare(b.name));
}

/** `@ivorie/ui/<x>` and `@ivorie/ui/extras/<x>` → `../<x>/public-api` (copied folders are siblings). */
export function rewriteImports(content: string): string {
  return content.replace(/'@ivorie\/ui\/(?:extras\/)?([a-z-]+)'/g, "'../$1/public-api'");
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
    const json = JSON.parse(readFileSync(join(UI, 'package.json'), 'utf8'));
    ranges = { ...json.peerDependencies, ...json.dependencies };
  }
  const range = ranges![pkg];
  if (!range) throw new Error(`registry: ${pkg} is imported but not in projects/ui/package.json`);
  return normalizeRange(range);
}

/** npm deps as `pkg@range`, sorted. */
export function collectDeps(e: Entry): string[] {
  const pkgs = new Set(
    imports(e)
      .filter((s) => !s.startsWith('@ivorie/ui'))
      .map(pkgOf)
      .filter((p) => !BUILT_IN.test(p)),
  );
  return [...pkgs].sort().map((p) => `${p}@${rangeOf(p)}`);
}

/** Other registry items this entry imports, sorted. */
export function registryDeps(e: Entry): string[] {
  const names = imports(e)
    .map((s) => /^@ivorie\/ui\/(?:extras\/)?([a-z-]+)$/.exec(s)?.[1])
    .filter((n): n is string => !!n && n !== e.name);
  return [...new Set(names)].sort();
}

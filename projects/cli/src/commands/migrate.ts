// ivorie migrate [paths…]: updates code written for the old ui-* components.
// Uses the rename map (symbols + selectors), rewrites import paths, and turns <iv-button> into <button ivButton>.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emptyReport, type Report } from './report.ts';

export interface MigrateOptions {
  cwd: string;
  dryRun?: boolean;
  renameMap?: string;
}

interface RenameMap {
  files: [string, string][];
  symbols: [string, string][];
  selectors: [string, string][];
}

const SKIP = new Set(['node_modules', 'dist', '.angular', '.git']);
const bundledMap = () => fileURLToPath(new URL('../migrate/rename-map.json', import.meta.url));

/** Patterns migrate cannot fix safely, from the BREAKING commits. */
const MANUAL: [RegExp, string][] = [
  [/\.setActive\(/, 'IvTabs.setActive → select'],
  [/\b\w*[tT]rigger\w*\.isActive\b(?!\s*\()/, 'IvTabsTrigger.isActive is a signal → isActive()'],
  [/\bsidebar\w*\.(open|openMobile|isMobile|state)\b(?!\s*\()/i, 'IvSidebarService state is a signal → read it with ()'],
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  if (statSync(dir).isFile()) return /\.(ts|html)$/.test(dir) ? [dir] : [];
  return readdirSync(dir)
    .filter((n) => !SKIP.has(n))
    .sort()
    .flatMap((n) => files(join(dir, n)));
}

export function createMigrator(map: RenameMap) {
  const entries = new Set(map.files.map(([from]) => /\/ui-([a-z-]+)\//.exec(from)?.[1]).filter(Boolean));
  const longestFirst = (list: [string, string][]) => [...list].sort((a, b) => b[0].length - a[0].length);
  const symbols = longestFirst(map.symbols).map(([from, to]) => [new RegExp(`\\b${escape(from)}\\b`, 'g'), to] as const);
  const selectors = longestFirst(map.selectors).map(
    ([from, to]) => [new RegExp(`(?<![\\w-])${escape(from)}(?![\\w-])`, 'g'), to] as const,
  );

  /** `…/ui-card/ui-card.component` → `@inlaylab/ivorie/card` for known entries. */
  const rewritePath = (spec: string) => {
    const parts = spec.split('/');
    const i = parts.findIndex((p, idx) => idx > 0 && p.startsWith('ui-') && entries.has(p.slice(3)));
    if (i < 0) return spec;
    const name = parts[i].slice(3);
    return `@inlaylab/ivorie/${name === 'select-picker' ? 'extras/select-picker' : name}`;
  };

  return (text: string): string => {
    let out = text.replace(/(\bfrom\s+|\bimport\s*\(\s*)(['"])([^'"]+)\2/g, (_m, pre, q, spec) => `${pre}${q}${rewritePath(spec)}${q}`);
    for (const [re, to] of symbols) out = out.replace(re, to);
    for (const [re, to] of selectors) out = out.replace(re, to);
    // The button is an attribute directive now.
    return out
      .replace(/<iv-button(\s[^>]*?)?\s*\/>/g, (_m, attrs = '') => `<button ivButton${attrs}></button>`)
      .replace(/<iv-button(?=[\s>])/g, '<button ivButton')
      .replace(/<\/iv-button>/g, '</button>');
  };
}

export async function runMigrate(paths: string[], o: MigrateOptions): Promise<Report> {
  const report = emptyReport();
  const map: RenameMap = JSON.parse(readFileSync(o.renameMap ?? bundledMap(), 'utf8'));
  const migrate = createMigrator(map);
  const targets = (paths.length ? paths : ['src']).flatMap((p) => files(join(o.cwd, p)));
  for (const file of [...new Set(targets)]) {
    const rel = relative(o.cwd, file).split('\\').join('/');
    const text = readFileSync(file, 'utf8');
    const next = migrate(text);
    next.split('\n').forEach((line, i) => {
      for (const [re, note] of MANUAL) if (re.test(line)) report.notes.push(`${rel}:${i + 1} ${note}`);
    });
    if (next === text) continue;
    report.written.push(rel);
    if (!o.dryRun) writeFileSync(file, next);
  }
  return report;
}

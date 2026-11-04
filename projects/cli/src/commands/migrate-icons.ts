// ivorie migrate icons --from <lib> --to <lib> [paths…]: renames @ng-icons names and imports between libraries.
import { readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { ICON_LIBRARIES, ICON_NAMES, ICON_PACKAGES, ICON_PREFIXES, LUCIDE_ALIASES, type IconLibrary } from '../icons.ts';
import { files } from './migrate.ts';
import { emptyReport, type Report } from './report.ts';

export interface MigrateIconsOptions {
  cwd: string;
  from?: string;
  to?: string;
  dryRun?: boolean;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const packageRoot = (lib: IconLibrary) => ICON_PACKAGES[lib].split('/').slice(0, 2).join('/');

function library(name: string | undefined, flag: string): IconLibrary {
  if (!ICON_LIBRARIES.includes(name as IconLibrary)) {
    throw new Error(`migrate icons needs --${flag} <${ICON_LIBRARIES.join('|')}>`);
  }
  return name as IconLibrary;
}

/** Rewrites one file's text. `missing` gets each source icon with no match in the target library. */
export function createIconMigrator(from: IconLibrary, to: IconLibrary) {
  const [f, t] = [ICON_LIBRARIES.indexOf(from), ICON_LIBRARIES.indexOf(to)];
  const map = new Map<string, string>();
  for (const row of ICON_NAMES) if (!map.has(row[f])) map.set(row[f], row[t]);
  if (from === 'lucide') for (const [old, name] of Object.entries(LUCIDE_ALIASES)) map.set(old, map.get(name)!);
  const name = new RegExp(`\\b${ICON_PREFIXES[from]}[A-Z0-9]\\w*\\b`, 'g');
  // phosphor: '@ng-icons/phosphor-icons' and '/regular' are the same regular icons.
  const pkg = new RegExp(`(['"])${escape(packageRoot(from))}(?:/regular)?\\1`, 'g');

  return function migrate(text: string, missing = new Set<string>()): string {
    const renamed = text.replace(name, (n) => {
      const next = map.get(n);
      if (!next) missing.add(n);
      return next ?? n;
    });
    return renamed.replace(pkg, (_m, q: string) => `${q}${ICON_PACKAGES[to]}${q}`);
  };
}

export async function runMigrateIcons(paths: string[], o: MigrateIconsOptions): Promise<Report> {
  const report = emptyReport();
  const from = library(o.from, 'from');
  const to = library(o.to, 'to');
  if (from === to) throw new Error('--from and --to are the same library');
  const migrate = createIconMigrator(from, to);
  for (const file of [...new Set((paths.length ? paths : ['src']).flatMap((p) => files(`${o.cwd}/${p}`)))]) {
    const rel = relative(o.cwd, file).split('\\').join('/');
    const text = readFileSync(file, 'utf8');
    const missing = new Set<string>();
    const next = migrate(text, missing);
    for (const n of missing) report.notes.push(`${rel}: ${n} has no ${to} match, left as is`);
    if (next === text) continue;
    report.written.push(rel);
    if (!o.dryRun) writeFileSync(file, next);
  }
  if (report.written.length) report.notes.push(`install ${packageRoot(to)} if the app does not have it`);
  return report;
}

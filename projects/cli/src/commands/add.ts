// ivorie add <names…>: copies component source (and what it needs) into the app.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { readConfig, type ComponentsJson } from '../config.ts';
import { installCommand, runInstall } from '../install.ts';
import { rewritePrefix } from '../prefix.ts';
import { detectProject } from '../project.ts';
import { bundledRegistry, openRegistry, packageName, resolveTree, type RegistryIndex } from '../registry.ts';
import { emptyReport, type CommonOptions, type Report } from './report.ts';

export interface AddOptions extends CommonOptions {
  overwrite?: boolean;
  all?: boolean;
  /** Used by init, before components.json is on disk. */
  config?: ComponentsJson;
  /** false: the caller handles npm deps (init). */
  deps?: boolean;
}

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

function checkNames(names: string[], index: RegistryIndex): void {
  const copyable = index.items.filter((i) => i.kind === 'component' || i.kind === 'lib');
  for (const name of names) {
    const item = index.items.find((i) => i.name === name);
    if (item && copyable.includes(item)) continue;
    if (item) throw new Error(`"${name}" is not a component — styles come from "ivorie init"`);
    const near = copyable.map((i) => i.name).filter((n) => distance(n, name) <= 2);
    throw new Error(`unknown component "${name}"${near.length ? ` — did you mean "${near.join('", "')}"?` : ''}`);
  }
}

/** Writes one file unless it would overwrite a changed user file. Reports paths relative to cwd. */
export function writeFile(r: Report, cwd: string, file: string, content: string, o: { overwrite?: boolean; dryRun?: boolean }) {
  const rel = relative(cwd, file).split('\\').join('/');
  if (existsSync(file)) {
    const current = readFileSync(file, 'utf8');
    if (current === content) return void r.unchanged.push(rel);
    if (!o.overwrite) return void r.skipped.push({ file: rel, reason: 'modified (use --overwrite)' });
  }
  r.written.push(rel);
  if (o.dryRun) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

export async function runAdd(names: string[], o: AddOptions, report: Report = emptyReport()): Promise<Report> {
  const config = o.config ?? readConfig(o.cwd);
  const reg = openRegistry(o.registry ?? config.registry ?? bundledRegistry());
  const index = await reg.index();
  const wanted = o.all ? index.items.filter((i) => i.kind === 'component').map((i) => i.name) : names;
  if (!wanted.length) throw new Error('name at least one component, e.g. "ivorie add button", or use --all');
  checkNames(wanted, index);

  const items = await resolveTree(reg, wanted);
  for (const item of items) {
    for (const f of item.files ?? []) {
      const target = join(o.cwd, config.path, f.path.replace(/^ui\//, ''));
      writeFile(report, o.cwd, target, rewritePrefix(f.content, config.prefix), o);
    }
  }

  if (o.deps === false) return report;
  const project = detectProject(o.cwd);
  const deps = [...new Set(items.flatMap((i) => i.dependencies ?? []))]
    .filter((d) => !project.deps.has(packageName(d)))
    .sort();
  if (deps.length) {
    if (o.skipInstall || o.dryRun) report.notes.push(installCommand(project.pm, deps).join(' '));
    else {
      await runInstall(project, deps);
      report.installed.push(...deps);
    }
  }
  return report;
}

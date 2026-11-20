// ivorie apply: change the theme of an app that ran `ivorie init`.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG_FILE, readConfig, type ComponentsJson } from '../config.ts';
import { ensureCssImports, relativeImport, setBodyThemeClass, setIconProvider } from '../edit.ts';
import { ICON_PACKAGES, type IconLibrary } from '../icons.ts';
import { installCommand, runInstall } from '../install.ts';
import { renderLook } from '../look.ts';
import { knownThemes, resolvePreset, savedLook, withSavedDials } from '../preset.ts';
import { detectProject, type Project } from '../project.ts';
import { bundledRegistry, openRegistry, packageName } from '../registry.ts';
import { runAdd, writeFile } from './add.ts';
import { emptyReport, type CommonOptions, type Report } from './report.ts';

export interface ApplyOptions extends CommonOptions {
  project?: string;
}

const importTarget = (line: string) => /^\s*@import\s+["']([^"']+)["']/.exec(line)?.[1];
// An Ivorie theme import, or a 1.5 style import it replaces. Known names only: an app's own theme-overrides.css stays.
const themeImportRe = (known: readonly string[]) => new RegExp(`/styles/(theme|style)-(${known.join('|')})\\.css$`);
const FONT_IMPORT = /^@fontsource-variable\//;

/** Drops the theme and font imports a new theme replaces. */
function dropLookImports(css: string, keep: string[], theme: RegExp): string {
  const eol = css.includes('\r\n') ? '\r\n' : '\n';
  const wanted = new Set(keep.map(importTarget));
  return css
    .split(/\r?\n/)
    .filter((l) => {
      const t = importTarget(l);
      return !t || wanted.has(t) || !(theme.test(t) || FONT_IMPORT.test(t));
    })
    .join(eol);
}

/**
 * Copies the icon set (none for lucide) and points app.config.ts at it.
 * Returns the @ng-icons packages the app draws its own icons with.
 */
export async function setIconLibrary(
  lib: IconLibrary,
  o: CommonOptions,
  config: ComponentsJson,
  project: Project,
  report: Report,
  edit: (file: string, change: (text: string) => string) => void,
): Promise<string[]> {
  if (lib !== 'lucide') await runAdd([`icons-${lib}`], { ...o, config, deps: false, overwrite: true }, report);
  const appConfig = `${project.sourceRoot}/app/app.config.ts`;
  const from = (dir: string) => relativeImport(appConfig, `${config.path}/${dir}/public-api`);
  if (existsSync(join(o.cwd, appConfig))) {
    edit(appConfig, (ts) => {
      const next = setIconProvider(ts, from('icon'), lib === 'lucide' ? undefined : from(`icons-${lib}`));
      if (lib !== 'lucide' && !next.includes('provideIvIcons(COMPONENT_ICONS)')) {
        report.notes.push(`add provideIvIcons(COMPONENT_ICONS) to the providers in ${appConfig}`);
      }
      return next;
    });
  } else if (lib !== 'lucide') {
    report.notes.push(`add provideIvIcons(COMPONENT_ICONS) to your app providers (no ${appConfig})`);
  }
  return ['@ng-icons/core', ICON_PACKAGES[lib].split('/').slice(0, 2).join('/')];
}

export async function runApply(input: string | undefined, o: ApplyOptions): Promise<Report> {
  if (!input) throw new Error('apply needs a theme name or an ivp1_ code');
  const report = emptyReport();
  const config = readConfig(o.cwd);
  const project = detectProject(o.cwd, { project: o.project });
  const reg = openRegistry(o.registry ?? config.registry ?? bundledRegistry());
  const index = await reg.index();
  // A theme picked by name keeps the dials saved in components.json; a code brings its own.
  const named = resolvePreset(input, index);
  let preset = named;
  if (!input.startsWith('ivp1_')) {
    try {
      preset = withSavedDials(named, config.preset, index);
    } catch {
      report.notes.push('components.json "preset" is not a valid ivp1_ code: saved dials were not kept');
    }
  }
  const look = await renderLook(preset, reg, config.path, config.tailwind.css);
  report.notes.push(...look.notes);

  const edit = (file: string, change: (text: string) => string) => {
    const full = join(o.cwd, file);
    const text = existsSync(full) ? readFileSync(full, 'utf8') : '';
    const next = change(text);
    if (next === text) return void report.unchanged.push(file);
    report.written.push(file);
    if (!o.dryRun) writeFileSync(full, next);
  };
  const write = (file: string, content: string) =>
    writeFile(report, o.cwd, join(o.cwd, file), content, { overwrite: true, dryRun: o.dryRun });

  const { fontHeading: _, accent: _a, chartColor: _c, menuAccent: _m, preset: _p, ...rest } = config;
  const saved = savedLook(preset, index);
  const next: ComponentsJson = {
    ...rest,
    theme: preset.theme,
    tailwind: { ...config.tailwind, baseColor: preset.baseColor },
    font: preset.font,
    ...(preset.fontHeading !== 'inherit' && { fontHeading: preset.fontHeading }),
    radius: preset.radius,
    iconLibrary: preset.iconLibrary as IconLibrary,
    ...(preset.accent !== 'base' && { accent: preset.accent }),
    ...(preset.chartColor !== 'accent' && { chartColor: preset.chartColor }),
    ...(preset.menuAccent !== 'subtle' && { menuAccent: preset.menuAccent }),
    ...(saved && { preset: saved }),
  };
  edit(CONFIG_FILE, (text) => (JSON.stringify(JSON.parse(text), null, 2) === JSON.stringify(next, null, 2) ? text : JSON.stringify(next, null, 2) + '\n'));
  write(`${config.path}/styles/theme.css`, look.themeCss);
  write(`${config.path}/styles/${look.themeFile}`, look.themeFileCss);

  const themeImport = look.imports.at(-1)!;
  const themeRe = themeImportRe(knownThemes(index));
  edit(config.tailwind.css, (css) => {
    if (!css.split(/\r?\n/).some((l) => themeRe.test(importTarget(l) ?? ''))) {
      report.notes.push(`no theme import found in ${config.tailwind.css}; added ${themeImport}`);
    }
    return ensureCssImports(dropLookImports(css, look.imports, themeRe), look.imports);
  });
  if (existsSync(join(o.cwd, project.indexHtml))) edit(project.indexHtml, (html) => setBodyThemeClass(html, preset.theme, knownThemes(index)));
  else report.notes.push(`set class="theme-${preset.theme}" on <body> (no ${project.indexHtml})`);

  // A 1.5 app has style-<name>.css; a theme switch leaves theme-<old>.css behind.
  for (const old of [`style-${config.theme}.css`, `theme-${config.theme}.css`]) {
    if (old !== look.themeFile && existsSync(join(o.cwd, config.path, 'styles', old))) {
      report.notes.push(`${old} is no longer used; delete it if you did not change it`);
    }
  }

  const iconDeps = await setIconLibrary(next.iconLibrary, o, next, project, report, edit);
  if (config.iconLibrary !== next.iconLibrary) {
    report.notes.push(`your own icons: npx ivorie migrate icons --from ${config.iconLibrary} --to ${next.iconLibrary}`);
  }

  const missing = [...look.dependencies, ...iconDeps].filter((d) => !project.deps.has(packageName(d)));
  if (missing.length) {
    if (o.skipInstall || o.dryRun) report.notes.push(installCommand(project.pm, missing, false).join(' '));
    else {
      await runInstall(project, missing, false);
      report.installed.push(...missing);
    }
  }
  return report;
}

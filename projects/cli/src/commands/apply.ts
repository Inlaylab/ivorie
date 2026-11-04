// ivorie apply: change the look of an app that ran `ivorie init`.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG_FILE, readConfig, type ComponentsJson } from '../config.ts';
import { ensureCssImports, relativeImport, setBodyStyleClass, setIconProvider } from '../edit.ts';
import { ICON_PACKAGES, type IconLibrary } from '../icons.ts';
import { installCommand, runInstall } from '../install.ts';
import { renderLook } from '../look.ts';
import { resolvePreset } from '../preset.ts';
import { detectProject, type Project } from '../project.ts';
import { bundledRegistry, openRegistry, packageName } from '../registry.ts';
import { runAdd, writeFile } from './add.ts';
import { emptyReport, type CommonOptions, type Report } from './report.ts';

export interface ApplyOptions extends CommonOptions {
  project?: string;
}

const importTarget = (line: string) => /^\s*@import\s+["']([^"']+)["']/.exec(line)?.[1];
const STYLE_IMPORT = /\/styles\/style-[a-z]+\.css$/;
const FONT_IMPORT = /^@fontsource-variable\//;

/** Drops the style and font imports a new look replaces. */
function dropLookImports(css: string, keep: string[]): string {
  const eol = css.includes('\r\n') ? '\r\n' : '\n';
  const wanted = new Set(keep.map(importTarget));
  return css
    .split(/\r?\n/)
    .filter((l) => {
      const t = importTarget(l);
      return !t || wanted.has(t) || !(STYLE_IMPORT.test(t) || FONT_IMPORT.test(t));
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
  if (!input) throw new Error('apply needs a preset name or an ivp1_ code');
  const report = emptyReport();
  const config = readConfig(o.cwd);
  const project = detectProject(o.cwd, { project: o.project });
  const reg = openRegistry(o.registry ?? config.registry ?? bundledRegistry());
  const preset = resolvePreset(input, await reg.index());
  const look = await renderLook(preset, reg, config.path, config.tailwind.css);

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

  const { fontHeading: _, ...rest } = config;
  const next: ComponentsJson = {
    ...rest,
    style: preset.style,
    tailwind: { ...config.tailwind, baseColor: preset.baseColor },
    font: preset.font,
    ...(preset.fontHeading !== 'inherit' && { fontHeading: preset.fontHeading }),
    radius: preset.radius,
    iconLibrary: preset.iconLibrary as IconLibrary,
  };
  edit(CONFIG_FILE, (text) => (JSON.stringify(JSON.parse(text), null, 2) === JSON.stringify(next, null, 2) ? text : JSON.stringify(next, null, 2) + '\n'));
  write(`${config.path}/styles/theme.css`, look.themeCss);
  write(`${config.path}/styles/${look.styleFile}`, look.styleCss);

  const styleImport = look.imports.at(-1)!;
  edit(config.tailwind.css, (css) => {
    if (!css.split(/\r?\n/).some((l) => STYLE_IMPORT.test(importTarget(l) ?? ''))) {
      report.notes.push(`no style import found in ${config.tailwind.css}; added ${styleImport}`);
    }
    return ensureCssImports(dropLookImports(css, look.imports), look.imports);
  });
  if (existsSync(join(o.cwd, project.indexHtml))) edit(project.indexHtml, (html) => setBodyStyleClass(html, preset.style));
  else report.notes.push(`set class="style-${preset.style}" on <body> (no ${project.indexHtml})`);

  if (config.style !== preset.style) {
    report.notes.push(`style-${config.style}.css is no longer used; delete it if you did not change it`);
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

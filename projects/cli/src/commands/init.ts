// ivorie init: components.json, theme CSS, core, styles.css imports, body class, Tailwind PostCSS.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { CONFIG_FILE, SCHEMA_URL, validateConfig, type ComponentsJson } from '../config.ts';
import { ensureCssImports, setBodyThemeClass } from '../edit.ts';
import { installCommand, runInstall } from '../install.ts';
import { THEME_ALIASES, checkPreset, knownThemes, resolvePreset, savedLook } from '../preset.ts';
import { detectProject } from '../project.ts';
import { bundledRegistry, openRegistry, packageName, type RegistryIndex } from '../registry.ts';
import { renderLook } from '../look.ts';
import { runAdd, writeFile } from './add.ts';
import { setIconLibrary } from './apply.ts';
import type { IconLibrary } from '../icons.ts';
import { emptyReport, type CommonOptions, type Report } from './report.ts';

export interface InitOptions extends CommonOptions {
  project?: string;
  path?: string;
  prefix?: string;
  /** A theme name or an ivp1_ code. */
  theme?: string;
  /** Deprecated (1.5): the same as `theme`. */
  preset?: string;
  /** Deprecated (1.5): swaps only the theme CSS, keeping the other defaults. */
  style?: string;
  baseColor?: string;
  font?: string;
  fontHeading?: string;
  radius?: string;
  iconLibrary?: string;
  accent?: string;
  chartColor?: string;
  menuAccent?: string;
  force?: boolean;
  yes?: boolean;
}

const DEFAULT_PATH = 'src/app/ui';
const DEFAULT_PREFIX = 'iv';
const RUNTIME_DEPS = ['@angular/cdk@^22.0.0', 'tw-animate-css'];
const TAILWIND_DEPS = ['tailwindcss', '@tailwindcss/postcss', 'postcss'];
const POSTCSS = '{\n  "plugins": {\n    "@tailwindcss/postcss": {}\n  }\n}\n';

async function ask(question: string, fallback: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(`${question} (${fallback}) `)).trim() || fallback;
  } finally {
    rl.close();
  }
}

/** True when some PostCSS config already loads @tailwindcss/postcss. */
function hasTailwindPostcss(root: string): boolean {
  return readdirSync(root)
    .filter((f) => f === '.postcssrc.json' || f === '.postcssrc' || /^postcss\.config\.[cm]?[jt]s$/.test(f))
    .some((f) => readFileSync(join(root, f), 'utf8').includes('@tailwindcss/postcss'));
}

/**
 * 1.5 flags, kept until 2.0: `--preset` is `--theme`; `--theme <accent>` (an accent, not a theme) is `--accent`.
 * Accent and theme names do not overlap, so the old meaning is read from the value.
 */
export function legacyFlags(o: InitOptions, index: RegistryIndex, report: Report): { theme?: string; accent?: string } {
  let { theme, accent } = o;
  if (o.preset !== undefined) {
    report.notes.push('--preset is now --theme; --preset leaves in 2.0');
    theme ??= o.preset;
  }
  if (o.style !== undefined) report.notes.push('--style leaves in 2.0; use --theme');
  const isTheme = (t: string) => t.startsWith('ivp1_') || t in index.presets || index.themes.includes(t);
  if (o.theme !== undefined && !isTheme(o.theme) && ['base', ...(index.accents ?? [])].includes(o.theme)) {
    report.notes.push(`--theme ${o.theme} is an accent: use --accent ${o.theme}; the old meaning leaves in 2.0`);
    accent ??= o.theme;
    theme = o.preset;
  }
  return { theme, accent };
}

export async function runInit(o: InitOptions): Promise<Report> {
  const report = emptyReport();
  const project = detectProject(o.cwd, { project: o.project });
  if (existsSync(join(o.cwd, CONFIG_FILE)) && !o.force) throw new Error('already initialized — use --force');

  const reg = openRegistry(o.registry ?? bundledRegistry());
  const index = await reg.index();
  const { theme, accent } = legacyFlags(o, index, report);
  const preset = { ...resolvePreset(theme, index) };
  if (o.style) preset.theme = THEME_ALIASES[o.style] ?? o.style;
  if (o.baseColor) preset.baseColor = o.baseColor;
  if (o.font) preset.font = o.font;
  if (o.fontHeading) preset.fontHeading = o.fontHeading;
  if (o.radius) preset.radius = o.radius;
  if (o.iconLibrary) preset.iconLibrary = o.iconLibrary;
  if (accent) preset.accent = accent;
  if (o.chartColor) preset.chartColor = o.chartColor;
  if (o.menuAccent) preset.menuAccent = o.menuAccent;
  checkPreset(preset, index);

  const interactive = process.stdin.isTTY && !o.yes && !o.dryRun;
  const path = (o.path ?? (interactive ? await ask('Where should components go?', DEFAULT_PATH) : DEFAULT_PATH)).replace(/\/+$/, '');
  const prefix = o.prefix ?? (interactive ? await ask('Selector prefix?', DEFAULT_PREFIX) : DEFAULT_PREFIX);

  const config: ComponentsJson = validateConfig({
    $schema: SCHEMA_URL,
    path,
    prefix,
    theme: preset.theme,
    tailwind: { css: project.stylesFile, baseColor: preset.baseColor },
    font: preset.font,
    ...(preset.fontHeading !== 'inherit' && { fontHeading: preset.fontHeading }),
    radius: preset.radius,
    iconLibrary: preset.iconLibrary as IconLibrary,
    ...(preset.accent !== 'base' && { accent: preset.accent }),
    ...(preset.chartColor !== 'accent' && { chartColor: preset.chartColor }),
    ...(preset.menuAccent !== 'subtle' && { menuAccent: preset.menuAccent }),
    ...(savedLook(preset, index) && { preset: savedLook(preset, index) }),
  });
  const write = (file: string, content: string) =>
    writeFile(report, o.cwd, join(o.cwd, file), content, { overwrite: o.force, dryRun: o.dryRun });

  write(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');

  const look = await renderLook(preset, reg, path, project.stylesFile);
  report.notes.push(...look.notes);
  write(`${path}/styles/theme.css`, look.themeCss);
  write(`${path}/styles/${look.themeFile}`, look.themeFileCss);

  await runAdd(['core'], { ...o, config, deps: false, overwrite: o.force }, report);
  const core = await reg.item('core');

  // User files: the edits are idempotent, so they are always applied.
  const edit = (file: string, change: (text: string) => string) => {
    const full = join(o.cwd, file);
    const text = existsSync(full) ? readFileSync(full, 'utf8') : '';
    const next = change(text);
    if (next === text) return void report.unchanged.push(file);
    report.written.push(file);
    if (!o.dryRun) writeFileSync(full, next);
  };
  edit(project.stylesFile, (css) => ensureCssImports(css, look.imports));
  if (existsSync(join(o.cwd, project.indexHtml))) edit(project.indexHtml, (html) => setBodyThemeClass(html, preset.theme, knownThemes(index)));
  else report.notes.push(`add class="theme-${preset.theme}" to <body> (no ${project.indexHtml})`);

  const iconDeps = await setIconLibrary(config.iconLibrary, o, config, project, report, edit);

  if (!hasTailwindPostcss(o.cwd)) {
    if (existsSync(join(o.cwd, '.postcssrc.json'))) {
      report.notes.push('add "@tailwindcss/postcss": {} to the plugins in .postcssrc.json');
    } else write('.postcssrc.json', POSTCSS);
  }

  const missing = (deps: string[]) => deps.filter((d) => !project.deps.has(packageName(d)));
  const deps = missing([...new Set([...(core.dependencies ?? []), ...RUNTIME_DEPS, ...look.dependencies, ...iconDeps])].sort());
  const devDeps = missing(TAILWIND_DEPS);
  for (const [list, dev] of [
    [deps, false],
    [devDeps, true],
  ] as const) {
    if (!list.length) continue;
    if (o.skipInstall || o.dryRun) report.notes.push(installCommand(project.pm, list, dev).join(' '));
    else {
      await runInstall(project, list, dev);
      report.installed.push(...list);
    }
  }
  return report;
}

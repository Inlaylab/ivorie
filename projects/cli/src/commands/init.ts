// ivorie init: components.json, theme + style CSS, core, styles.css imports, body class, Tailwind PostCSS.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { CONFIG_FILE, SCHEMA_URL, validateConfig, type ComponentsJson } from '../config.ts';
import { ensureCssImports, relativeImport, setBodyStyleClass } from '../edit.ts';
import { installCommand, runInstall } from '../install.ts';
import { checkPreset, resolvePreset } from '../preset.ts';
import { detectProject } from '../project.ts';
import { bundledRegistry, openRegistry, packageName } from '../registry.ts';
import { renderTheme } from '../theme.ts';
import { runAdd, writeFile } from './add.ts';
import { emptyReport, type CommonOptions, type Report } from './report.ts';

export interface InitOptions extends CommonOptions {
  project?: string;
  path?: string;
  prefix?: string;
  preset?: string;
  style?: string;
  baseColor?: string;
  force?: boolean;
  yes?: boolean;
}

const DEFAULT_PATH = 'src/app/ui';
const DEFAULT_PREFIX = 'iv';
const RUNTIME_DEPS = ['@angular/cdk@^22.0.0', '@lucide/angular', 'tw-animate-css'];
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

export async function runInit(o: InitOptions): Promise<Report> {
  const report = emptyReport();
  const project = detectProject(o.cwd, { project: o.project });
  if (existsSync(join(o.cwd, CONFIG_FILE)) && !o.force) throw new Error('already initialized — use --force');

  const reg = openRegistry(o.registry ?? bundledRegistry());
  const index = await reg.index();
  const preset = { ...resolvePreset(o.preset, index) };
  if (o.style) preset.style = o.style;
  if (o.baseColor) preset.baseColor = o.baseColor;
  checkPreset(preset, index);

  const interactive = process.stdin.isTTY && !o.yes && !o.dryRun;
  const path = (o.path ?? (interactive ? await ask('Where should components go?', DEFAULT_PATH) : DEFAULT_PATH)).replace(/\/+$/, '');
  const prefix = o.prefix ?? (interactive ? await ask('Selector prefix?', DEFAULT_PREFIX) : DEFAULT_PREFIX);

  const config: ComponentsJson = validateConfig({
    $schema: SCHEMA_URL,
    path,
    prefix,
    style: preset.style,
    tailwind: { css: project.stylesFile, baseColor: preset.baseColor },
    font: preset.font,
    radius: preset.radius,
    iconLibrary: 'lucide',
  });
  const write = (file: string, content: string) =>
    writeFile(report, o.cwd, join(o.cwd, file), content, { overwrite: o.force, dryRun: o.dryRun });

  write(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');

  const [base, color, style] = await Promise.all([
    reg.item('theme-base'),
    reg.item(`theme-${preset.baseColor}`),
    reg.item(`style-${preset.style}`),
  ]);
  const theme = renderTheme({ base: base.files![0].content, ...color.cssVars! }, { imports: false });
  write(`${path}/styles/theme.css`, theme);
  write(`${path}/styles/style-${preset.style}.css`, style.files![0].content);

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
  const rel = (to: string) => relativeImport(project.stylesFile, to);
  edit(project.stylesFile, (css) =>
    ensureCssImports(css, [
      '@import "tailwindcss";',
      '@import "tw-animate-css";',
      `@import "${rel(`${path}/styles/theme.css`)}";`,
      `@import "${rel(`${path}/styles/style-${preset.style}.css`)}";`,
    ]),
  );
  if (existsSync(join(o.cwd, project.indexHtml))) edit(project.indexHtml, (html) => setBodyStyleClass(html, preset.style));
  else report.notes.push(`add class="style-${preset.style}" to <body> (no ${project.indexHtml})`);

  if (!hasTailwindPostcss(o.cwd)) {
    if (existsSync(join(o.cwd, '.postcssrc.json'))) {
      report.notes.push('add "@tailwindcss/postcss": {} to the plugins in .postcssrc.json');
    } else write('.postcssrc.json', POSTCSS);
  }

  const missing = (deps: string[]) => deps.filter((d) => !project.deps.has(packageName(d)));
  const deps = missing([...new Set([...(core.dependencies ?? []), ...RUNTIME_DEPS])].sort());
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

// theme.css = base CSS + the :root / .dark var blocks. Split and joined here, shared by the
// registry build and the CLI, so new base colors are data (var maps), not code.

export interface ThemeParts {
  base: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

/** Marks where the var blocks go inside `base`. */
const SLOT = '/* ivorie:theme-vars */';
const IMPORTS = '@import "tailwindcss";\n@import "tw-animate-css";\n';

function block(css: string, selector: string): { start: number; end: number; vars: Record<string, string> } {
  const start = css.search(new RegExp(`^${selector.replace('.', '\.')} \{$`, 'm'));
  if (start < 0) throw new Error(`theme: no ${selector} block`);
  const end = css.indexOf('\n}', start) + 2;
  const vars: Record<string, string> = {};
  for (const m of css.slice(start, end).matchAll(/^ {2}(--[\w-]+): (.+);$/gm)) vars[m[1]] = m[2];
  return { start, end, vars };
}

export function parseTheme(css: string): ThemeParts {
  css = css.replace(/\r\n/g, '\n');
  const light = block(css, ':root');
  const dark = block(css, '.dark');
  if (css.slice(light.end, dark.start) !== '\n\n') throw new Error('theme: :root and .dark must be adjacent');
  return { base: css.slice(0, light.start) + SLOT + css.slice(dark.end), light: light.vars, dark: dark.vars };
}

const render = (selector: string, vars: Record<string, string>) =>
  `${selector} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};\n`).join('')}}`;

/** imports: true keeps the tailwindcss / tw-animate-css imports (library form); false drops them (CLI form). */
export function renderTheme(parts: ThemeParts, opts: { imports?: boolean } = {}): string {
  let base = parts.base;
  if (!opts.imports && base.startsWith(IMPORTS)) base = base.slice(IMPORTS.length).replace(/^\n/, '');
  return base.replace(SLOT, `${render(':root', parts.light)}\n\n${render('.dark', parts.dark)}`);
}

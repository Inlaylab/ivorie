// The cn-* hook classes used by the library sources.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { THEME_ALIASES } from '../../projects/cli/src/preset.ts';

export const UI = 'projects/ui';
export const STYLES = join(UI, 'styles');
export const HOOK = /(?<![\w-])cn-[a-z0-9-]*[a-z0-9]/g;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'styles' || name === 'testing' ? [] : sources(path);
    return /\.(ts|html)$/.test(name) && !name.endsWith('.spec.ts') ? [path] : [];
  });
}

/** Theme names with a generated file in projects/ui/styles (`theme-<name>.css`). */
export const themeNames = (): string[] =>
  readdirSync(STYLES)
    .flatMap((f) => /^theme-([a-z]+)\.css$/.exec(f)?.[1] ?? [])
    .filter((n) => !(n in THEME_ALIASES));

/** The 1.5 path `style-<name>.css`: one import of the theme file. shortcut: alias until 2.0. */
export const styleAlias = (name: string) =>
  `/* Ivorie 1.5 name for theme-${name}.css, kept until 2.0. Import theme-${name}.css instead. */\n@import "./theme-${name}.css";\n`;

/** A renamed theme's old file: one import of the new one. shortcut: alias until 2.0. */
export const renamedAlias = (old: string, name: string) =>
  `/* Ivorie 1.5 name for theme-${name}.css (${old} is now ${name}), kept until 2.0. Import theme-${name}.css instead. */\n@import "./theme-${name}.css";\n`;

/** The theme's scope also matches the classes of its old names. */
export function withAliasClasses(name: string, css: string): string {
  const classes = Object.keys(THEME_ALIASES)
    .filter((o) => THEME_ALIASES[o] === name)
    .map((o) => `, .theme-${o}, .style-${o}`)
    .join('');
  return css.replace(`:is(.theme-${name}, .style-${name})`, `:is(.theme-${name}, .style-${name}${classes})`);
}

/**
 * Writes `theme-<name>.css` and its 1.5 alias `style-<name>.css`. A renamed theme also answers to its old
 * classes (`theme-<old>`, `style-<old>`), and its old files import the new one.
 */
export function writeTheme(name: string, css: string): void {
  const olds = Object.keys(THEME_ALIASES).filter((o) => THEME_ALIASES[o] === name);
  writeFileSync(join(STYLES, `theme-${name}.css`), withAliasClasses(name, css));
  writeFileSync(join(STYLES, `style-${name}.css`), styleAlias(name));
  for (const o of olds) {
    writeFileSync(join(STYLES, `theme-${o}.css`), renamedAlias(o, name));
    writeFileSync(join(STYLES, `style-${o}.css`), renamedAlias(o, name));
  }
}

export function uiHooks(): Set<string> {
  return new Set(sources(UI).flatMap((file) => readFileSync(file, 'utf8').match(HOOK) ?? []));
}

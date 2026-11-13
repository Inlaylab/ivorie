// The files and packages one preset needs. Shared by `init` and `apply`.
import { relativeImport } from './edit.ts';
import { RADII, chartSource, lookVars, type Preset } from './preset.ts';
import type { Registry } from './registry.ts';
import { renderTheme } from './theme.ts';

export interface Look {
  /** theme.css for <path>/styles/. */
  themeCss: string;
  styleFile: string;
  styleCss: string;
  /** @import lines for the app styles file, in order. */
  imports: string[];
  /** Font packages to install. */
  dependencies: string[];
}

export async function renderLook(preset: Preset, reg: Registry, path: string, stylesFile: string): Promise<Look> {
  const styleFile = `style-${preset.style}.css`;
  const heading = preset.fontHeading === 'inherit' ? undefined : preset.fontHeading;
  const fontNames = [preset.font === 'system' ? undefined : preset.font, heading].filter((f) => f !== undefined);
  const chartColor = chartSource(preset);
  const accentNames = [...new Set([preset.theme, chartColor].filter((a) => a !== 'base'))];
  const [base, color, style, ...rest] = await Promise.all([
    reg.item('theme-base'),
    reg.item(`theme-${preset.baseColor}`),
    reg.item(`style-${preset.style}`),
    ...accentNames.map((a) => reg.item(`theme-accent-${a}`)),
    ...fontNames.map((f) => reg.item(`font-${f}`)),
  ]);
  const accents = rest.slice(0, accentNames.length);
  const fonts = rest.slice(accentNames.length);
  const accent = (name: string) => accents[accentNames.indexOf(name)]?.cssVars;
  const family = (name: string) => fonts.find((f) => f.name === `font-${name}`)!.font!.family;

  const vars = (mode: 'light' | 'dark') =>
    lookVars(color.cssVars![mode], accent(preset.theme)?.[mode], accent(chartColor)?.[mode] ?? color.cssVars![mode], preset.menuAccent);
  const light = vars('light');
  const radius = RADII[preset.radius];
  if (radius !== null && radius !== undefined) light['--radius'] = radius;
  let themeCss = renderTheme({ base: base.files![0].content, light, dark: vars('dark') }, { imports: false });

  const tokens = [
    ...(preset.font === 'system' ? [] : [`  --font-sans: ${family(preset.font)};`]),
    ...(heading ? [`  --font-heading: ${family(heading)};`] : []),
  ];
  if (tokens.length) themeCss += `\n@theme {\n${tokens.join('\n')}\n}\n`;

  const dependencies = [...new Set(fonts.map((f) => f.font!.dependency))];
  const rel = (to: string) => relativeImport(stylesFile, to);
  return {
    themeCss,
    styleFile,
    styleCss: style.files![0].content,
    imports: [
      '@import "tailwindcss";',
      '@import "tw-animate-css";',
      ...dependencies.map((d) => `@import "${d}";`),
      `@import "${rel(`${path}/styles/theme.css`)}";`,
      `@import "${rel(`${path}/styles/${styleFile}`)}";`,
    ],
    dependencies,
  };
}

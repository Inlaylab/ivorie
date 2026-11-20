// The files and packages one preset needs. Shared by `init` and `apply`.
import { relativeImport } from './edit.ts';
import {
  MOTION_OFF_CSS,
  RADII,
  SHARED_DIALS,
  chartSource,
  contrastVars,
  dialVars,
  droppedDials,
  lookVars,
  type Preset,
} from './preset.ts';
import type { Registry } from './registry.ts';
import { renderTheme } from './theme.ts';

export interface Look {
  /** theme.css for <path>/styles/. */
  themeCss: string;
  /** theme-<name>.css for <path>/styles/. */
  themeFile: string;
  themeFileCss: string;
  /** @import lines for the app styles file, in order. */
  imports: string[];
  /** Font packages to install. */
  dependencies: string[];
  /** Lines for the user, such as dials the theme ignores. */
  notes: string[];
}

export async function renderLook(preset: Preset, reg: Registry, path: string, stylesFile: string): Promise<Look> {
  const themeFile = `theme-${preset.theme}.css`;
  const heading = preset.fontHeading === 'inherit' ? undefined : preset.fontHeading;
  const fontNames = [preset.font === 'system' ? undefined : preset.font, heading].filter((f) => f !== undefined);
  const chartColor = chartSource(preset);
  const accentNames = [...new Set([preset.accent, chartColor].filter((a) => a !== 'base'))];
  const [index, base, color, themeItem, ...rest] = await Promise.all([
    reg.index(),
    reg.item('theme-base'),
    reg.item(`theme-${preset.baseColor}`),
    // The registry keeps its item names: theme-<color> already names the base colors.
    reg.item(`style-${preset.theme}`),
    ...accentNames.map((a) => reg.item(`theme-accent-${a}`)),
    ...fontNames.map((f) => reg.item(`font-${f}`)),
  ]);
  const accents = rest.slice(0, accentNames.length);
  const fonts = rest.slice(accentNames.length);
  const accent = (name: string) => accents[accentNames.indexOf(name)]?.cssVars;
  const family = (name: string) => fonts.find((f) => f.name === `font-${name}`)!.font!.family;

  const dials = index.themeDials?.[preset.theme] ?? SHARED_DIALS;
  const vars = (mode: 'light' | 'dark') => {
    const v = lookVars(color.cssVars![mode], accent(preset.accent)?.[mode], accent(chartColor)?.[mode] ?? color.cssVars![mode], preset.menuAccent);
    return dials.includes('contrast') ? { ...v, ...contrastVars(v, preset.contrast) } : v;
  };
  const light = vars('light');
  const radius = RADII[preset.radius];
  if (radius !== null && radius !== undefined) light['--radius'] = radius;
  Object.assign(light, dialVars(preset, dials));
  let themeCss = renderTheme({ base: base.files![0].content, light, dark: vars('dark') }, { imports: false });
  if (dials.includes('motion') && preset.motion === 'off') themeCss += `
${MOTION_OFF_CSS}`;

  const tokens = [
    ...(preset.font === 'system' ? [] : [`  --font-sans: ${family(preset.font)};`]),
    ...(heading ? [`  --font-heading: ${family(heading)};`] : []),
  ];
  if (tokens.length) themeCss += `\n@theme {\n${tokens.join('\n')}\n}\n`;

  const dependencies = [...new Set(fonts.map((f) => f.font!.dependency))];
  const rel = (to: string) => relativeImport(stylesFile, to);
  return {
    themeCss,
    themeFile,
    themeFileCss: themeItem.files![0].content,
    imports: [
      '@import "tailwindcss";',
      '@import "tw-animate-css";',
      ...dependencies.map((d) => `@import "${d}";`),
      `@import "${rel(`${path}/styles/theme.css`)}";`,
      `@import "${rel(`${path}/styles/${themeFile}`)}";`,
    ],
    dependencies,
    notes: [
      ...(index.legacyThemes?.includes(preset.theme) ? [`theme "${preset.theme}" is legacy and leaves in 2.0`] : []),
      ...droppedDials(preset, dials).map((dial) => `dial "${dial}" does nothing on theme "${preset.theme}"`),
    ],
  };
}

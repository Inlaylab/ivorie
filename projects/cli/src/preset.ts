// A preset names one choice per theme axis. Shared as a short code: 'ivp1_' + base64url(JSON).
import { ICON_LIBRARIES } from './icons.ts';
import type { RegistryIndex } from './registry.ts';

export interface Preset {
  style: string;
  baseColor: string;
  font: string;
  /** 'inherit' = same as font. Left out of the code when 'inherit', so 1.1 codes stay valid. */
  fontHeading: string;
  radius: string;
  /** Left out of the code when 'lucide', so older codes stay valid. */
  iconLibrary: string;
  /** An accent color over the base color, or 'base' for none. Left out of the code when 'base'. */
  theme: string;
  /** Where chart colors come from: 'theme' (follow theme), 'base' (the base color's greys) or an accent. */
  chartColor: string;
  /** 'bold' paints menu highlights in the primary color. Left out of the code when 'subtle'. */
  menuAccent: string;
}

export const DEFAULT_PRESET: Preset = {
  style: 'nova',
  baseColor: 'neutral',
  font: 'system',
  fontHeading: 'inherit',
  radius: 'default',
  iconLibrary: 'lucide',
  theme: 'base',
  chartColor: 'theme',
  menuAccent: 'subtle',
};

export const MENU_ACCENTS = ['subtle', 'bold'] as const;

/** --radius per radius name. null keeps the theme value (0.625rem). Names and values from shadcn/ui. */
export const RADII: Record<string, string | null> = {
  default: null,
  none: '0',
  small: '0.45rem',
  medium: '0.625rem',
  large: '0.875rem',
};

type Vars = Record<string, string>;
/**
 * One mode's color variables, in shadcn's order: base color, accent, chart colors, menu accent.
 * `chart` is the base color or accent the --chart-* come from.
 */
export function lookVars(base: Vars, accent: Vars | undefined, chart: Vars, menuAccent: string): Vars {
  const out = { ...base, ...accent };
  for (const i of [1, 2, 3, 4, 5]) out[`--chart-${i}`] = chart[`--chart-${i}`];
  if (menuAccent === 'bold') {
    out['--accent'] = out['--primary'];
    out['--accent-foreground'] = out['--primary-foreground'];
  }
  return out;
}

/** The accent the charts use: chartColor, or theme when chartColor is 'theme'. 'base' = the base color. */
export const chartSource = (p: { theme: string; chartColor: string }): string => (p.chartColor === 'theme' ? p.theme : p.chartColor);

const PREFIX = 'ivp1_';
const KEYS = ['baseColor', 'chartColor', 'font', 'fontHeading', 'iconLibrary', 'menuAccent', 'radius', 'style', 'theme'] as const;
// Optional keys and the value they take when left out.
const OPTIONAL: Partial<Record<keyof Preset, string>> = {
  fontHeading: 'inherit',
  iconLibrary: 'lucide',
  theme: 'base',
  chartColor: 'theme',
  menuAccent: 'subtle',
};
const OPTIONS: Record<Exclude<keyof Preset, 'fontHeading' | 'iconLibrary' | 'theme' | 'chartColor' | 'menuAccent'>, 'styles' | 'baseColors' | 'fonts' | 'radii'> = {
  style: 'styles',
  baseColor: 'baseColors',
  font: 'fonts',
  radius: 'radii',
};

export function encodePreset(p: Preset): string {
  const keys = KEYS.filter((k) => !(k in OPTIONAL) || (p[k] ?? OPTIONAL[k]) !== OPTIONAL[k]);
  const sorted = Object.fromEntries(keys.map((k) => [k, p[k]]));
  return PREFIX + Buffer.from(JSON.stringify(sorted)).toString('base64url');
}

export function decodePreset(code: string): Preset {
  try {
    const raw = code.startsWith(PREFIX) ? code.slice(PREFIX.length) : '';
    if (!/^[A-Za-z0-9_-]+$/.test(raw)) throw new Error();
    const value = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!KEYS.every((k) => typeof value?.[k] === 'string' || (k in OPTIONAL && value?.[k] === undefined))) {
      throw new Error();
    }
    const { style, baseColor, font, fontHeading = 'inherit', radius, iconLibrary = 'lucide' } = value;
    const { theme = 'base', chartColor = 'theme', menuAccent = 'subtle' } = value;
    return { style, baseColor, font, fontHeading, radius, iconLibrary, theme, chartColor, menuAccent };
  } catch {
    throw new Error('invalid preset code');
  }
}

/** undefined → the default preset; a preset name; or an 'ivp1_' code. Each field must exist in the index. */
export function resolvePreset(input: string | undefined, index: RegistryIndex): Preset {
  const preset =
    input === undefined
      ? index.presets['default']
      : input.startsWith(PREFIX)
        ? decodePreset(input)
        : index.presets[input];
  if (!preset) throw new Error(`unknown preset "${input}"`);
  // Named presets from older registries have no fontHeading, iconLibrary or accent fields.
  const full = { ...DEFAULT_PRESET, ...preset };
  checkPreset(full, index);
  return full;
}

/** Throws `unknown <axis> "<value>" (available: …)` when a field is not in the index. */
export function checkPreset(p: Preset, index: RegistryIndex): void {
  const axes = Object.entries(OPTIONS).map(([axis, key]) => [axis, index[key]] as const);
  const headings = ['inherit', ...index.fonts.filter((f) => f !== 'system')];
  const accents = index.accents ?? [];
  for (const [axis, available] of [
    ...axes,
    ['fontHeading', headings] as const,
    ['iconLibrary', ICON_LIBRARIES] as const,
    ['theme', ['base', ...accents]] as const,
    ['chartColor', ['theme', 'base', ...accents]] as const,
    ['menuAccent', MENU_ACCENTS] as const,
  ]) {
    const value = p[axis as keyof Preset];
    if (!(available as readonly string[]).includes(value)) {
      throw new Error(`unknown ${axis} "${value}" (available: ${available.join(', ')})`);
    }
  }
}

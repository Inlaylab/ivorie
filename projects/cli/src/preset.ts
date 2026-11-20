// A preset names one choice per theme axis. Shared as a short code: 'ivp1_' + base64url(JSON).
import { ICON_LIBRARIES } from './icons.ts';
import type { RegistryIndex } from './registry.ts';

export interface Preset {
  /** The theme: its CSS file and class (`theme-<name>`). */
  theme: string;
  baseColor: string;
  font: string;
  /** 'inherit' = same as font. Left out of the code when 'inherit', so 1.1 codes stay valid. */
  fontHeading: string;
  radius: string;
  /** Left out of the code when 'lucide', so older codes stay valid. */
  iconLibrary: string;
  /** An accent color over the base color, or 'base' for none. Left out of the code when 'base'. */
  accent: string;
  /** Where chart colors come from: 'accent' (follow the accent), 'base' (the base color's greys) or an accent. */
  chartColor: string;
  /** 'bold' paints menu highlights in the primary color. Left out of the code when 'subtle'. */
  menuAccent: string;
  // Dials tune a theme inside its signature. Each is left out of the code at its default.
  density: string;
  contrast: string;
  motion: string;
  panels: string;
  rim: string;
  shadow: string;
  blur: string;
  ambient: string;
}

export type DialKey = 'density' | 'contrast' | 'motion' | 'panels' | 'rim' | 'shadow' | 'blur' | 'ambient';

/** Values per dial, default first. */
export const DIALS: Record<DialKey, readonly string[]> = {
  density: ['default', 'compact', 'roomy'],
  contrast: ['default', 'soft', 'high'],
  motion: ['calm', 'snappy', 'off'],
  panels: ['default', 'solid', 'translucent'],
  rim: ['default', 'none', 'subtle', 'strong'],
  shadow: ['default', 'none', 'soft', 'deep'],
  blur: ['default', 'low', 'high'],
  ambient: ['default', 'off', 'soft', 'vivid'],
};

/** Dials every theme takes, Classic themes included. */
export const SHARED_DIALS: readonly DialKey[] = ['density', 'contrast', 'motion'];

const DIAL_DEFAULTS = Object.fromEntries(Object.entries(DIALS).map(([dial, values]) => [dial, values[0]])) as Record<DialKey, string>;

/** Neutral values for fields a preset leaves out (nova, neutral, no accent, dials at default). */
export const FILL_PRESET: Preset = {
  theme: 'nova',
  baseColor: 'neutral',
  font: 'system',
  fontHeading: 'inherit',
  radius: 'default',
  iconLibrary: 'lucide',
  accent: 'base',
  chartColor: 'accent',
  menuAccent: 'subtle',
  ...DIAL_DEFAULTS,
};

/** Renamed themes: the old name keeps working until 2.0 (CLI name, share code, class, file). shortcut: alias until 2.0. */
export const THEME_ALIASES: Record<string, string> = { graphite: 'slate' };

/** Every Ivorie theme name, old aliases included: the only `theme-*` / `style-*` names the CLI may replace. */
export const knownThemes = (index: RegistryIndex): string[] => [...new Set([...index.themes, ...Object.keys(THEME_ALIASES)])];

/**
 * The default theme, slate: zinc with the blue accent, Geist and a small radius. `ivorie init` and the docs use it.
 * Density stays default: it sets --spacing on :root, which scales all of the app's Tailwind spacing.
 */
export const DEFAULT_PRESET: Preset = { ...FILL_PRESET, theme: 'slate', baseColor: 'zinc', accent: 'blue', font: 'geist', radius: 'small' };

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

// How far each contrast level moves a token toward its target: the % of the token that is kept.
// Soft keeps muted text: in light mode it already sits at 4.5:1 for every base color.
const CONTRAST_MIX: Record<string, { toward: string; border: number; muted?: number }> = {
  high: { toward: '--foreground', border: 60, muted: 70 },
  soft: { toward: '--background', border: 40 },
};

// Mode-free CSS vars per dial value. Contrast and motion off are written by contrastVars and MOTION_OFF_CSS.
const DIAL_VARS: Partial<Record<DialKey, Record<string, Vars>>> = {
  density: { compact: { '--spacing': '0.2rem' }, roomy: { '--spacing': '0.3rem' } },
  // Own themes re-declare --muted-foreground on every descendant; they keep this share of it (CONTRAST_MIX.high.muted).
  contrast: { high: { '--iv-muted-keep': String(CONTRAST_MIX['high'].muted! / 100) } },
  motion: {
    snappy: { '--default-transition-duration': '120ms', '--default-transition-timing-function': 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  },
  panels: { solid: { '--iv-panel-solid': '1' }, translucent: { '--iv-panel-solid': '0' } },
  rim: { none: { '--iv-rim': '0' }, subtle: { '--iv-rim': '0.5' }, strong: { '--iv-rim': '2.2' } },
  shadow: { none: { '--iv-shadow': '0' }, soft: { '--iv-shadow': '0.5' }, deep: { '--iv-shadow': '2.2' } },
  blur: { low: { '--iv-blur': '0.3' }, high: { '--iv-blur': '2' } },
  ambient: { off: { '--iv-ambient': '0' }, soft: { '--iv-ambient': '0.5' }, vivid: { '--iv-ambient': '2.5' } },
};

/** The vars for the allowed dials that are not at their default. */
export function dialVars(p: Preset, allowed: readonly DialKey[]): Vars {
  return Object.assign({}, ...allowed.map((dial) => DIAL_VARS[dial]?.[p[dial]]));
}

/** Dials set away from their default that the style does not take. */
export const droppedDials = (p: Preset, allowed: readonly DialKey[]): DialKey[] =>
  (Object.keys(DIALS) as DialKey[]).filter((dial) => p[dial] !== DIALS[dial][0] && !allowed.includes(dial));


/** One mode's --border and --input (and --muted-foreground for high), remixed for the contrast level. */
export function contrastVars(vars: Vars, level: string): Vars {
  const mix = CONTRAST_MIX[level];
  if (!mix) return {};
  const remix = (name: string, keep: number) => `color-mix(in oklab, ${vars[name]} ${keep}%, ${vars[mix.toward]})`;
  return {
    '--border': remix('--border', mix.border),
    '--input': remix('--input', mix.border),
    ...(mix.muted && { '--muted-foreground': remix('--muted-foreground', mix.muted) }),
  };
}

/** Motion off: no transitions or animations. */
export const MOTION_OFF_CSS = `@layer base {
  *,
  ::before,
  ::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
}
`;

/** The accent the charts use: chartColor, or the accent when chartColor is 'accent'. 'base' = the base color. */
export const chartSource = (p: { accent: string; chartColor: string }): string => (p.chartColor === 'accent' ? p.accent : p.chartColor);

const PREFIX = 'ivp1_';
// The code's JSON keys. They predate the one-concept rename and never change, so every old code stays
// valid: wire `style` is the theme, wire `theme` the accent, and wire chartColor 'theme' means 'accent'.
const KEYS = [
  'ambient', 'baseColor', 'blur', 'chartColor', 'contrast', 'density', 'font', 'fontHeading', 'iconLibrary',
  'menuAccent', 'motion', 'panels', 'radius', 'rim', 'shadow', 'style', 'theme',
] as const;
type WireKey = (typeof KEYS)[number];
// Optional wire keys and the value they take when left out.
const OPTIONAL: Partial<Record<WireKey, string>> = {
  fontHeading: 'inherit',
  iconLibrary: 'lucide',
  theme: 'base',
  chartColor: 'theme',
  menuAccent: 'subtle',
  ...DIAL_DEFAULTS,
};
const OPTIONS: Record<'theme' | 'baseColor' | 'font' | 'radius', 'themes' | 'baseColors' | 'fonts' | 'radii'> = {
  theme: 'themes',
  baseColor: 'baseColors',
  font: 'fonts',
  radius: 'radii',
};

function toWire(p: Preset): Record<WireKey, string> {
  const { theme, accent, ...rest } = p;
  return { ...rest, style: theme, theme: accent, chartColor: p.chartColor === 'accent' ? 'theme' : p.chartColor };
}

function fromWire(w: Record<WireKey, string>): Preset {
  const { style, theme, ...rest } = w;
  return { ...rest, theme: THEME_ALIASES[style] ?? style, accent: theme, chartColor: w.chartColor === 'theme' ? 'accent' : w.chartColor };
}

/** A dial's value when the user left it alone: the theme's own (mono: snappy motion), else the global default. */
const themeDial = (theme: string, d: DialKey, index: RegistryIndex): string => index.presets[theme]?.[d] ?? DIALS[d][0];

/** Dials the user set, measured against the theme's own values: a theme's defaults are not user choices. */
const userDials = (p: Preset, index: RegistryIndex): DialKey[] =>
  (Object.keys(DIALS) as DialKey[]).filter((d) => p[d] !== themeDial(p.theme, d, index));

/** The look to keep in components.json when the user set a dial; undefined otherwise. */
export const savedLook = (p: Preset, index: RegistryIndex): string | undefined => (userDials(p, index).length ? encodePreset(p) : undefined);

/** The user's dials from a saved look, put on a theme picked by name. The new theme keeps its own values for the rest. */
export function withSavedDials(p: Preset, saved: string | undefined, index: RegistryIndex): Preset {
  if (!saved) return p;
  const from = decodePreset(saved);
  return { ...p, ...Object.fromEntries(userDials(from, index).map((d) => [d, from[d]])) };
}

export function encodePreset(p: Preset): string {
  const wire = toWire(p);
  const keys = KEYS.filter((k) => !(k in OPTIONAL) || (wire[k] ?? OPTIONAL[k]) !== OPTIONAL[k]);
  const sorted = Object.fromEntries(keys.map((k) => [k, wire[k]]));
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
    return fromWire(Object.fromEntries(KEYS.map((k) => [k, value[k] ?? OPTIONAL[k]])) as Record<WireKey, string>);
  } catch {
    throw new Error('invalid preset code');
  }
}

/**
 * undefined → the default theme; a theme name; or an 'ivp1_' code. Each field must exist in the index.
 * A theme with no defaults of its own (a legacy theme) takes the neutral fill.
 */
export function resolvePreset(input: string | undefined, index: RegistryIndex): Preset {
  // The alias only where the registry lacks the old name: a hosted 1.5 registry still has graphite, not slate.
  if (input !== undefined && !(input in index.presets) && !index.themes.includes(input)) input = THEME_ALIASES[input] ?? input;
  const preset =
    input === undefined
      ? index.presets['default']
      : input.startsWith(PREFIX)
        ? decodePreset(input)
        : (index.presets[input] ?? (index.themes.includes(input) ? { theme: input } : undefined));
  if (!preset) {
    const names = Object.keys(index.presets).filter((n) => n !== 'default');
    throw new Error(`unknown theme "${input}"${names.length ? ` (available: ${names.join(', ')})` : ''}`);
  }
  // Named presets from older registries leave out newer fields: fill them with neutral values.
  const full = { ...FILL_PRESET, ...preset };
  // A code decodes graphite to slate; on a registry with graphite and no slate, keep the old name.
  if (!index.themes.includes(full.theme)) {
    const old = Object.keys(THEME_ALIASES).find((k) => THEME_ALIASES[k] === full.theme && index.themes.includes(k));
    if (old) full.theme = old;
  }
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
    ['accent', ['base', ...accents]] as const,
    ['chartColor', ['accent', 'base', ...accents]] as const,
    ['menuAccent', MENU_ACCENTS] as const,
    ...Object.entries(DIALS),
  ]) {
    const value = p[axis as keyof Preset];
    if (!(available as readonly string[]).includes(value)) {
      throw new Error(`unknown ${axis} "${value}" (available: ${available.join(', ')})`);
    }
  }
}

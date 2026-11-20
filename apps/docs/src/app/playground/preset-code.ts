// Browser copy of the CLI share code (projects/cli/src/preset.ts): 'ivp1_' + base64url(JSON, sorted keys).
// No imports, so tools/docs/looks.test.ts can check it against the CLI in Node.

export interface Preset {
  /** The theme: its CSS file and class (`theme-<name>`). */
  theme: string;
  baseColor: string;
  font: string;
  fontHeading: string;
  radius: string;
  iconLibrary: string;
  /** An accent color over the base color, or 'base' for none. */
  accent: string;
  /** 'accent' (follow the accent), 'base' (the base color's greys) or an accent. */
  chartColor: string;
  menuAccent: string;
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

/** Neutral values for fields a preset leaves out. */
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

/** The default theme, slate: zinc with the blue accent, Geist and a small radius. `ivorie init` and the docs use it. */
export const DEFAULT_PRESET: Preset = { ...FILL_PRESET, theme: 'slate', baseColor: 'zinc', accent: 'blue', font: 'geist', radius: 'small' };

const PREFIX = 'ivp1_';
// The code's JSON keys never change, so every old code stays valid: wire `style` is the theme,
// wire `theme` the accent, and wire chartColor 'theme' means 'accent'.
const KEYS = [
  'ambient', 'baseColor', 'blur', 'chartColor', 'contrast', 'density', 'font', 'fontHeading', 'iconLibrary',
  'menuAccent', 'motion', 'panels', 'radius', 'rim', 'shadow', 'style', 'theme',
] as const;
type WireKey = (typeof KEYS)[number];
// Left out of the code at these values, so older codes stay valid.
const OPTIONAL: Partial<Record<WireKey, string>> = {
  fontHeading: 'inherit',
  iconLibrary: 'lucide',
  theme: 'base',
  chartColor: 'theme',
  menuAccent: 'subtle',
  ...DIAL_DEFAULTS,
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

/** Dials set away from their default that the theme does not take. */
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

function toWire(p: Preset): Record<WireKey, string> {
  const { theme, accent, ...rest } = p;
  return { ...rest, style: theme, theme: accent, chartColor: p.chartColor === 'accent' ? 'theme' : p.chartColor };
}

function fromWire(w: Record<WireKey, string>): Preset {
  const { style, theme, ...rest } = w;
  return { ...rest, theme: THEME_ALIASES[style] ?? style, accent: theme, chartColor: w.chartColor === 'theme' ? 'accent' : w.chartColor };
}

export function encodePreset(p: Preset): string {
  const wire = toWire(p);
  const keys = KEYS.filter((k) => !(k in OPTIONAL) || wire[k] !== OPTIONAL[k]);
  const json = JSON.stringify(Object.fromEntries(keys.map((k) => [k, wire[k]])));
  const bin = String.fromCharCode(...new TextEncoder().encode(json));
  return PREFIX + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** null for anything that is not a valid code. Values are not checked against the options here. */
export function decodePreset(code: string): Preset | null {
  try {
    const raw = code.startsWith(PREFIX) ? code.slice(PREFIX.length) : '';
    if (!/^[A-Za-z0-9_-]+$/.test(raw)) return null;
    const bin = atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
    const v = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    const ok = KEYS.every((k) => typeof v?.[k] === 'string' || (k in OPTIONAL && v?.[k] === undefined));
    if (!ok) return null;
    return fromWire(Object.fromEntries(KEYS.map((k) => [k, v[k] ?? OPTIONAL[k]])) as Record<WireKey, string>);
  } catch {
    return null;
  }
}

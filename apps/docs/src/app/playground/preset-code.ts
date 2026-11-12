// Browser copy of the CLI share code (projects/cli/src/preset.ts): 'ivp1_' + base64url(JSON, sorted keys).
// No imports, so tools/docs/looks.test.ts can check it against the CLI in Node.

export interface Preset {
  style: string;
  baseColor: string;
  font: string;
  fontHeading: string;
  radius: string;
  iconLibrary: string;
  theme: string;
  chartColor: string;
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

const PREFIX = 'ivp1_';
const KEYS = ['baseColor', 'chartColor', 'font', 'fontHeading', 'iconLibrary', 'menuAccent', 'radius', 'style', 'theme'] as const;
// Left out of the code at these values, so older codes stay valid.
const OPTIONAL: Partial<Record<keyof Preset, string>> = {
  fontHeading: 'inherit',
  iconLibrary: 'lucide',
  theme: 'base',
  chartColor: 'theme',
  menuAccent: 'subtle',
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


export function encodePreset(p: Preset): string {
  const keys = KEYS.filter((k) => !(k in OPTIONAL) || p[k] !== OPTIONAL[k]);
  const json = JSON.stringify(Object.fromEntries(keys.map((k) => [k, p[k]])));
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
    return { ...DEFAULT_PRESET, ...Object.fromEntries(KEYS.filter((k) => v[k] !== undefined).map((k) => [k, v[k]])) };
  } catch {
    return null;
  }
}

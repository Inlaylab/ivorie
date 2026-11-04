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
}

export const DEFAULT_PRESET: Preset = {
  style: 'nova',
  baseColor: 'neutral',
  font: 'system',
  fontHeading: 'inherit',
  radius: 'default',
  iconLibrary: 'lucide',
};

/** --radius per radius name. null keeps the theme value (0.625rem). Names and values from shadcn/ui. */
export const RADII: Record<string, string | null> = {
  default: null,
  none: '0',
  small: '0.45rem',
  medium: '0.625rem',
  large: '0.875rem',
};

const PREFIX = 'ivp1_';
const KEYS = ['baseColor', 'font', 'fontHeading', 'iconLibrary', 'radius', 'style'] as const;
// Optional keys and the value they take when left out.
const OPTIONAL: Partial<Record<keyof Preset, string>> = { fontHeading: 'inherit', iconLibrary: 'lucide' };
const OPTIONS: Record<Exclude<keyof Preset, 'fontHeading' | 'iconLibrary'>, 'styles' | 'baseColors' | 'fonts' | 'radii'> = {
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
    return { style, baseColor, font, fontHeading, radius, iconLibrary };
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
  // Named presets from older registries have no fontHeading or iconLibrary.
  const full = { ...preset, fontHeading: preset.fontHeading ?? 'inherit', iconLibrary: preset.iconLibrary ?? 'lucide' };
  checkPreset(full, index);
  return full;
}

/** Throws `unknown <axis> "<value>" (available: …)` when a field is not in the index. */
export function checkPreset(p: Preset, index: RegistryIndex): void {
  const axes = Object.entries(OPTIONS).map(([axis, key]) => [axis, index[key]] as const);
  const headings = ['inherit', ...index.fonts.filter((f) => f !== 'system')];
  for (const [axis, available] of [...axes, ['fontHeading', headings] as const, ['iconLibrary', ICON_LIBRARIES] as const]) {
    const value = p[axis as keyof Preset];
    if (!(available as readonly string[]).includes(value)) {
      throw new Error(`unknown ${axis} "${value}" (available: ${available.join(', ')})`);
    }
  }
}

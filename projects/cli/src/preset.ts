// A preset names one choice per theme axis. Shared as a short code: 'ivp1_' + base64url(JSON).
import type { RegistryIndex } from './registry.ts';

export interface Preset {
  style: string;
  baseColor: string;
  font: string;
  radius: string;
}

export const DEFAULT_PRESET: Preset = { style: 'maia', baseColor: 'neutral', font: 'system', radius: 'default' };

const PREFIX = 'ivp1_';
const KEYS = ['baseColor', 'font', 'radius', 'style'] as const;
const OPTIONS: Record<keyof Preset, 'styles' | 'baseColors' | 'fonts' | 'radii'> = {
  style: 'styles',
  baseColor: 'baseColors',
  font: 'fonts',
  radius: 'radii',
};

export function encodePreset(p: Preset): string {
  const sorted = Object.fromEntries(KEYS.map((k) => [k, p[k]]));
  return PREFIX + Buffer.from(JSON.stringify(sorted)).toString('base64url');
}

export function decodePreset(code: string): Preset {
  try {
    const raw = code.startsWith(PREFIX) ? code.slice(PREFIX.length) : '';
    if (!/^[A-Za-z0-9_-]+$/.test(raw)) throw new Error();
    const value = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!KEYS.every((k) => typeof value?.[k] === 'string')) throw new Error();
    return { style: value.style, baseColor: value.baseColor, font: value.font, radius: value.radius };
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
  checkPreset(preset, index);
  return preset;
}

/** Throws `unknown <axis> "<value>" (available: …)` when a field is not in the index. */
export function checkPreset(p: Preset, index: RegistryIndex): void {
  for (const axis of Object.keys(OPTIONS) as (keyof Preset)[]) {
    const available = index[OPTIONS[axis]];
    if (!available.includes(p[axis])) {
      throw new Error(`unknown ${axis} "${p[axis]}" (available: ${available.join(', ')})`);
    }
  }
}

// Browser copy of the CLI share code (projects/cli/src/preset.ts): 'ivp1_' + base64url(JSON, sorted keys).
// No imports, so tools/docs/looks.test.ts can check it against the CLI in Node.

export interface Preset {
  style: string;
  baseColor: string;
  font: string;
  fontHeading: string;
  radius: string;
}

export const DEFAULT_PRESET: Preset = {
  style: 'maia',
  baseColor: 'neutral',
  font: 'system',
  fontHeading: 'inherit',
  radius: 'default',
};

const PREFIX = 'ivp1_';
const KEYS = ['baseColor', 'font', 'fontHeading', 'radius', 'style'] as const;

export function encodePreset(p: Preset): string {
  const keys = KEYS.filter((k) => k !== 'fontHeading' || p.fontHeading !== 'inherit');
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
    const ok = KEYS.every((k) => typeof v?.[k] === 'string' || (k === 'fontHeading' && v?.[k] === undefined));
    if (!ok) return null;
    return { style: v.style, baseColor: v.baseColor, font: v.font, fontHeading: v.fontHeading ?? 'inherit', radius: v.radius };
  } catch {
    return null;
  }
}

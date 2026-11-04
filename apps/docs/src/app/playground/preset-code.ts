// Browser copy of the CLI share code (projects/cli/src/preset.ts): 'ivp1_' + base64url(JSON, sorted keys).
// No imports, so tools/docs/looks.test.ts can check it against the CLI in Node.

export interface Preset {
  style: string;
  baseColor: string;
  font: string;
  fontHeading: string;
  radius: string;
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

const PREFIX = 'ivp1_';
const KEYS = ['baseColor', 'font', 'fontHeading', 'iconLibrary', 'radius', 'style'] as const;
// Left out of the code at these values, so older codes stay valid.
const OPTIONAL: Partial<Record<keyof Preset, string>> = { fontHeading: 'inherit', iconLibrary: 'lucide' };

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
    return { style: v.style, baseColor: v.baseColor, font: v.font, fontHeading: v.fontHeading ?? 'inherit', radius: v.radius, iconLibrary: v.iconLibrary ?? 'lucide' };
  } catch {
    return null;
  }
}

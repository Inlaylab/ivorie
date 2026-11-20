import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PRESET, DIALS, FILL_PRESET, SHARED_DIALS, dialVars, savedLook, withSavedDials, RADII, chartSource, checkPreset, decodePreset, encodePreset, lookVars, resolvePreset } from '../src/preset.ts';
import { PRESET_GOLDEN } from './preset.fixture.ts';
import type { RegistryIndex } from '../src/registry.ts';

const index = {
  version: '0.0.0',
  items: [],
  themes: ['nova'],
  baseColors: ['neutral'],
  fonts: ['system'],
  radii: ['default'],
  presets: { default: FILL_PRESET },
} satisfies RegistryIndex;

test('encode then decode returns the same preset', () => {
  const code = encodePreset(FILL_PRESET);
  assert.match(code, /^ivp1_[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodePreset(code), FILL_PRESET);
});

test('undefined and "default" resolve to the index default', () => {
  assert.deepEqual(resolvePreset(undefined, index), FILL_PRESET);
  assert.deepEqual(resolvePreset('default', index), FILL_PRESET);
});

test('a code with an unknown theme throws with the options', () => {
  const code = encodePreset({ ...FILL_PRESET, theme: 'luma' });
  assert.throws(() => resolvePreset(code, index), { message: 'unknown theme "luma" (available: nova)' });
});

test('an unknown name throws', () => {
  assert.throws(() => resolvePreset('xyz', index), { message: 'unknown theme "xyz"' });
});

test('a bad code throws', () => {
  assert.throws(() => decodePreset('ivp1_!!!'), { message: 'invalid preset code' });
  assert.throws(() => resolvePreset('ivp1_e30', index), { message: 'invalid preset code' });
});

// Made by 1.0 and 1.1, before fontHeading. Must never change.
const CODE_1_1 =
  'ivp1_eyJiYXNlQ29sb3IiOiJuZXV0cmFsIiwiZm9udCI6InN5c3RlbSIsInJhZGl1cyI6ImRlZmF1bHQiLCJzdHlsZSI6Im1haWEifQ';

test('the 1.1 default (maia) still gives the 1.1 code', () => {
  assert.equal(encodePreset({ ...FILL_PRESET, theme: 'maia' }), CODE_1_1);
});

test('a 1.1 code decodes with fontHeading inherit', () => {
  assert.deepEqual(decodePreset(CODE_1_1), { ...FILL_PRESET, theme: 'maia', fontHeading: 'inherit' });
  assert.equal(FILL_PRESET.fontHeading, 'inherit');
});

test('the golden preset round-trips to its code', () => {
  assert.equal(encodePreset(PRESET_GOLDEN.preset), PRESET_GOLDEN.code);
  assert.deepEqual(decodePreset(PRESET_GOLDEN.code), PRESET_GOLDEN.preset);
});

const full = {
  ...index,
  themes: ['maia', 'nova'],
  baseColors: ['neutral', 'olive'],
  fonts: ['system', 'inter', 'lora'],
  radii: Object.keys(RADII),
} satisfies RegistryIndex;

test('checkPreset accepts the golden preset', () => {
  assert.doesNotThrow(() => checkPreset(PRESET_GOLDEN.preset, full));
});

test('fontHeading must be inherit or a real font, not system', () => {
  assert.throws(() => checkPreset({ ...FILL_PRESET, fontHeading: 'system' }, full), {
    message: 'unknown fontHeading "system" (available: inherit, inter, lora)',
  });
});

test('RADII: default keeps the style radius, the rest set --radius', () => {
  assert.deepEqual(RADII, { default: null, none: '0', small: '0.45rem', medium: '0.625rem', large: '0.875rem' });
});

test('iconLibrary: left out of the code when lucide, kept otherwise, checked', () => {
  assert.equal(encodePreset(FILL_PRESET), encodePreset({ ...FILL_PRESET, iconLibrary: undefined as unknown as string }));
  const tabler = encodePreset({ ...FILL_PRESET, iconLibrary: 'tabler' });
  assert.notEqual(tabler, encodePreset(FILL_PRESET));
  assert.equal(resolvePreset(tabler, index).iconLibrary, 'tabler');
  const bad = encodePreset({ ...FILL_PRESET, iconLibrary: 'feather' });
  assert.throws(() => resolvePreset(bad, index), /unknown iconLibrary "feather"/);
});

test('accent fields: left out of the code at their defaults, kept and checked otherwise', () => {
  const withAccents = { ...index, accents: ['blue', 'rose'] } satisfies RegistryIndex;
  // Old codes (no accent fields) decode to the defaults.
  assert.deepEqual(decodePreset(CODE_1_1), { ...FILL_PRESET, theme: 'maia' });
  const p = { ...FILL_PRESET, accent: 'blue', chartColor: 'rose', menuAccent: 'bold' };
  assert.deepEqual(resolvePreset(encodePreset(p), withAccents), p);
  assert.throws(() => checkPreset({ ...FILL_PRESET, accent: 'teal' }, withAccents), /unknown accent "teal" \(available: base, blue, rose\)/);
  assert.throws(() => checkPreset({ ...FILL_PRESET, chartColor: 'teal' }, withAccents), /unknown chartColor "teal"/);
  assert.throws(() => checkPreset({ ...FILL_PRESET, menuAccent: 'loud' }, withAccents), /unknown menuAccent "loud"/);
});

test('lookVars: accent over base, charts from their source, bold menu accent', () => {
  const base = { '--primary': 'p0', '--primary-foreground': 'f0', '--accent': 'a0', '--accent-foreground': 'af0', '--chart-1': 'g1', '--chart-2': 'g2', '--chart-3': 'g3', '--chart-4': 'g4', '--chart-5': 'g5' };
  const blue = { '--primary': 'blue', '--primary-foreground': 'white', '--chart-1': 'b1', '--chart-2': 'b2', '--chart-3': 'b3', '--chart-4': 'b4', '--chart-5': 'b5' };
  const rose = { '--chart-1': 'r1', '--chart-2': 'r2', '--chart-3': 'r3', '--chart-4': 'r4', '--chart-5': 'r5' };
  const subtle = lookVars(base, blue, base, 'subtle');
  assert.equal(subtle['--primary'], 'blue');
  assert.equal(subtle['--chart-1'], 'g1');
  assert.equal(subtle['--accent'], 'a0');
  const bold = lookVars(base, blue, rose, 'bold');
  assert.equal(bold['--chart-5'], 'r5');
  assert.equal(bold['--accent'], 'blue');
  assert.equal(bold['--accent-foreground'], 'white');
  assert.equal(chartSource({ accent: 'blue', chartColor: 'accent' }), 'blue');
  assert.equal(chartSource({ accent: 'blue', chartColor: 'base' }), 'base');
});

const OLD_CODES = [CODE_1_1, PRESET_GOLDEN.code];

test('old codes are unchanged: they round-trip and every dial is at its default', () => {
  for (const code of OLD_CODES) {
    const p = decodePreset(code);
    assert.equal(encodePreset(p), code);
    for (const [dial, values] of Object.entries(DIALS)) assert.equal(p[dial as keyof typeof DIALS], values[0]);
  }
});

test('dials round-trip, and dials at their default stay out of the code', () => {
  const p = { ...FILL_PRESET, density: 'compact', rim: 'strong' };
  assert.deepEqual(decodePreset(encodePreset(p)), p);
  const json = Buffer.from(encodePreset(FILL_PRESET).slice('ivp1_'.length), 'base64url').toString();
  for (const dial of Object.keys(DIALS)) assert.doesNotMatch(json, new RegExp(`"${dial}"`));
});

test('an unknown dial value throws with the options', () => {
  assert.throws(() => checkPreset({ ...FILL_PRESET, rim: 'max' }, full), {
    message: 'unknown rim "max" (available: default, none, subtle, strong)',
  });
});

test('a named preset from an older registry is filled with neutral values', () => {
  const old = { ...index, presets: { default: { theme: 'nova', baseColor: 'neutral', font: 'system', radius: 'default' } as never } };
  assert.equal(resolvePreset(undefined, old).accent, 'base');
});

test('the default preset is the slate theme with the blue accent', () => {
  assert.deepEqual(DEFAULT_PRESET, { ...FILL_PRESET, theme: 'slate', baseColor: 'zinc', accent: 'blue', font: 'geist', radius: 'small' });
});

test('ambient: a dial with its own values, checked like the others', () => {
  assert.deepEqual(DIALS.ambient, ['default', 'off', 'soft', 'vivid']);
  assert.throws(() => checkPreset({ ...FILL_PRESET, ambient: 'max' }, full), {
    message: 'unknown ambient "max" (available: default, off, soft, vivid)',
  });
});

test('graphite, the 1.5 name of slate: a code that says graphite decodes to slate', () => {
  const code = encodePreset({ ...DEFAULT_PRESET, theme: 'graphite' });
  assert.equal(decodePreset(code).theme, 'slate');
});

test('contrast high also writes --iv-muted-keep, the muted share own themes keep', () => {
  assert.deepEqual(dialVars({ ...DEFAULT_PRESET, contrast: 'high' }, SHARED_DIALS), { '--iv-muted-keep': '0.7' });
  assert.deepEqual(dialVars({ ...DEFAULT_PRESET, contrast: 'soft' }, SHARED_DIALS), {});
});

// Dials measured against each theme's own preset: a theme's defaults (mono snappy, mira compact) are not user choices.
const dialIndex = { ...index, themes: ['slate', 'mono', 'mira'], presets: {
  default: { ...FILL_PRESET, theme: 'slate' },
  slate: { ...FILL_PRESET, theme: 'slate' },
  mono: { ...FILL_PRESET, theme: 'mono', motion: 'snappy' },
  mira: { ...FILL_PRESET, theme: 'mira', density: 'compact' },
} } satisfies RegistryIndex;

test("savedLook keeps only dials the user set: a theme's own dial defaults are not saved", () => {
  assert.equal(savedLook({ ...FILL_PRESET, theme: 'mono', motion: 'snappy' }, dialIndex), undefined);
  assert.equal(savedLook({ ...FILL_PRESET, theme: 'mira', density: 'compact' }, dialIndex), undefined);
  assert.ok(savedLook({ ...FILL_PRESET, theme: 'mono', motion: 'snappy', rim: 'strong' }, dialIndex));
});

test("withSavedDials carries only the user's dials: the new theme keeps its own defaults", () => {
  const saved = encodePreset({ ...FILL_PRESET, theme: 'mono', motion: 'snappy', rim: 'strong' });
  const slate = { ...FILL_PRESET, theme: 'slate' };
  assert.deepEqual(withSavedDials(slate, saved, dialIndex), { ...slate, rim: 'strong' });
  const mono = { ...FILL_PRESET, theme: 'mono', motion: 'snappy' };
  assert.deepEqual(withSavedDials(mono, encodePreset({ ...slate, rim: 'strong' }), dialIndex), { ...mono, rim: 'strong' });
  assert.equal(withSavedDials(mono, undefined, dialIndex), mono);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PRESET, RADII, chartSource, checkPreset, decodePreset, encodePreset, lookVars, resolvePreset } from '../src/preset.ts';
import { PRESET_GOLDEN } from './preset.fixture.ts';
import type { RegistryIndex } from '../src/registry.ts';

const index = {
  version: '0.0.0',
  items: [],
  styles: ['nova'],
  baseColors: ['neutral'],
  fonts: ['system'],
  radii: ['default'],
  presets: { default: DEFAULT_PRESET },
} satisfies RegistryIndex;

test('encode then decode returns the same preset', () => {
  const code = encodePreset(DEFAULT_PRESET);
  assert.match(code, /^ivp1_[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodePreset(code), DEFAULT_PRESET);
});

test('undefined and "default" resolve to the default preset', () => {
  assert.deepEqual(resolvePreset(undefined, index), DEFAULT_PRESET);
  assert.deepEqual(resolvePreset('default', index), DEFAULT_PRESET);
});

test('a code with an unknown style throws with the options', () => {
  const code = encodePreset({ ...DEFAULT_PRESET, style: 'luma' });
  assert.throws(() => resolvePreset(code, index), { message: 'unknown style "luma" (available: nova)' });
});

test('an unknown name throws', () => {
  assert.throws(() => resolvePreset('xyz', index), { message: 'unknown preset "xyz"' });
});

test('a bad code throws', () => {
  assert.throws(() => decodePreset('ivp1_!!!'), { message: 'invalid preset code' });
  assert.throws(() => resolvePreset('ivp1_e30', index), { message: 'invalid preset code' });
});

// Made by 1.0 and 1.1, before fontHeading. Must never change.
const CODE_1_1 =
  'ivp1_eyJiYXNlQ29sb3IiOiJuZXV0cmFsIiwiZm9udCI6InN5c3RlbSIsInJhZGl1cyI6ImRlZmF1bHQiLCJzdHlsZSI6Im1haWEifQ';

test('the 1.1 default (maia) still gives the 1.1 code', () => {
  assert.equal(encodePreset({ ...DEFAULT_PRESET, style: 'maia' }), CODE_1_1);
});

test('a 1.1 code decodes with fontHeading inherit', () => {
  assert.deepEqual(decodePreset(CODE_1_1), { ...DEFAULT_PRESET, style: 'maia', fontHeading: 'inherit' });
  assert.equal(DEFAULT_PRESET.fontHeading, 'inherit');
});

test('the golden preset round-trips to its code', () => {
  assert.equal(encodePreset(PRESET_GOLDEN.preset), PRESET_GOLDEN.code);
  assert.deepEqual(decodePreset(PRESET_GOLDEN.code), PRESET_GOLDEN.preset);
});

const full = {
  ...index,
  styles: ['maia', 'nova'],
  baseColors: ['neutral', 'olive'],
  fonts: ['system', 'inter', 'lora'],
  radii: Object.keys(RADII),
} satisfies RegistryIndex;

test('checkPreset accepts the golden preset', () => {
  assert.doesNotThrow(() => checkPreset(PRESET_GOLDEN.preset, full));
});

test('fontHeading must be inherit or a real font, not system', () => {
  assert.throws(() => checkPreset({ ...DEFAULT_PRESET, fontHeading: 'system' }, full), {
    message: 'unknown fontHeading "system" (available: inherit, inter, lora)',
  });
});

test('RADII: default keeps the style radius, the rest set --radius', () => {
  assert.deepEqual(RADII, { default: null, none: '0', small: '0.45rem', medium: '0.625rem', large: '0.875rem' });
});

test('iconLibrary: left out of the code when lucide, kept otherwise, checked', () => {
  assert.equal(encodePreset(DEFAULT_PRESET), encodePreset({ ...DEFAULT_PRESET, iconLibrary: undefined as unknown as string }));
  const tabler = encodePreset({ ...DEFAULT_PRESET, iconLibrary: 'tabler' });
  assert.notEqual(tabler, encodePreset(DEFAULT_PRESET));
  assert.equal(resolvePreset(tabler, index).iconLibrary, 'tabler');
  const bad = encodePreset({ ...DEFAULT_PRESET, iconLibrary: 'feather' });
  assert.throws(() => resolvePreset(bad, index), /unknown iconLibrary "feather"/);
});

test('accent fields: left out of the code at their defaults, kept and checked otherwise', () => {
  const withAccents = { ...index, accents: ['blue', 'rose'] } satisfies RegistryIndex;
  // Old codes (no accent fields) decode to the defaults.
  assert.deepEqual(decodePreset(CODE_1_1), { ...DEFAULT_PRESET, style: 'maia' });
  const p = { ...DEFAULT_PRESET, theme: 'blue', chartColor: 'rose', menuAccent: 'bold' };
  assert.deepEqual(resolvePreset(encodePreset(p), withAccents), p);
  assert.throws(() => checkPreset({ ...DEFAULT_PRESET, theme: 'teal' }, withAccents), /unknown theme "teal" \(available: base, blue, rose\)/);
  assert.throws(() => checkPreset({ ...DEFAULT_PRESET, chartColor: 'teal' }, withAccents), /unknown chartColor "teal"/);
  assert.throws(() => checkPreset({ ...DEFAULT_PRESET, menuAccent: 'loud' }, withAccents), /unknown menuAccent "loud"/);
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
  assert.equal(chartSource({ theme: 'blue', chartColor: 'theme' }), 'blue');
  assert.equal(chartSource({ theme: 'blue', chartColor: 'base' }), 'base');
});

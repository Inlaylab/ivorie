import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PRESET, RADII, checkPreset, decodePreset, encodePreset, resolvePreset } from '../src/preset.ts';
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

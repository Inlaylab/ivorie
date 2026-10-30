import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PRESET, decodePreset, encodePreset, resolvePreset } from '../src/preset.ts';
import type { RegistryIndex } from '../src/registry.ts';

const index = {
  version: '0.0.0',
  items: [],
  styles: ['maia'],
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
  assert.throws(() => resolvePreset(code, index), { message: 'unknown style "luma" (available: maia)' });
});

test('an unknown name throws', () => {
  assert.throws(() => resolvePreset('xyz', index), { message: 'unknown preset "xyz"' });
});

test('a bad code throws', () => {
  assert.throws(() => decodePreset('ivp1_!!!'), { message: 'invalid preset code' });
  assert.throws(() => resolvePreset('ivp1_e30', index), { message: 'invalid preset code' });
});

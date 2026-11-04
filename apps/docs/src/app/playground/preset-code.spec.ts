import { describe, expect, it } from 'vitest';
import { DEFAULT_PRESET, decodePreset, encodePreset } from './preset-code';

// Made by the 1.1 CLI, before fontHeading.
const CODE_1_1 =
  'ivp1_eyJiYXNlQ29sb3IiOiJuZXV0cmFsIiwiZm9udCI6InN5c3RlbSIsInJhZGl1cyI6ImRlZmF1bHQiLCJzdHlsZSI6Im1haWEifQ';

describe('preset code', () => {
  it('the 1.1 default (maia) still gives the 1.1 code', () => {
    const maia = { ...DEFAULT_PRESET, style: 'maia' };
    expect(encodePreset(maia)).toBe(CODE_1_1);
    expect(decodePreset(CODE_1_1)).toEqual(maia);
  });

  it('bad input gives null, never throws', () => {
    for (const bad of ['ivp1_!!', 'ivp1_e30', 'nope', '', 'ivp1_' + btoa('[1]')]) expect(decodePreset(bad)).toBeNull();
  });

  it('iconLibrary is left out at lucide and kept otherwise', () => {
    const tabler = { ...DEFAULT_PRESET, iconLibrary: 'tabler' };
    expect(encodePreset(tabler)).not.toBe(CODE_1_1);
    expect(decodePreset(encodePreset(tabler))).toEqual(tabler);
  });
});

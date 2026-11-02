// A non-default preset and its share code. The CLI, docs and smoke tests check against it.
import type { Preset } from './preset.ts';

export const PRESET_GOLDEN: { preset: Preset; code: string } = {
  preset: { style: 'nova', baseColor: 'olive', font: 'inter', fontHeading: 'lora', radius: 'large' },
  code: 'ivp1_eyJiYXNlQ29sb3IiOiJvbGl2ZSIsImZvbnQiOiJpbnRlciIsImZvbnRIZWFkaW5nIjoibG9yYSIsInJhZGl1cyI6ImxhcmdlIiwic3R5bGUiOiJub3ZhIn0',
};

// Themes: what users pick, and the only name for it. A theme is a theme-<name>.css file plus its own
// default colors, font, radius and dials; every default can be changed. The registry index lists the
// defaults as presets; `default` is slate (1.6: graphite). The docs read the labels, groups and notes from here too.
import { DEFAULT_PRESET, FILL_PRESET, type Preset } from '../../projects/cli/src/preset.ts';

// Ivorie's own first, then Classic (shadcn/ui). Neighbours differ in surface, light or dark, and hue.
export const THEME_ORDER = ['slate', 'glass', 'bento', 'midnight', 'clay', 'mono', 'tint', 'nova', 'luma', 'mira', 'sera'] as const;
export type ThemeName = (typeof THEME_ORDER)[number];

const theme = (fields: Partial<Preset>): Preset => ({ ...FILL_PRESET, ...fields });

export const THEMES: Record<ThemeName, Preset> = {
  slate: DEFAULT_PRESET,
  glass: theme({ theme: 'glass', accent: 'violet', font: 'inter', radius: 'large' }),
  bento: theme({ theme: 'bento', baseColor: 'neutral', accent: 'lime', font: 'outfit', radius: 'large' }),
  midnight: theme({ theme: 'midnight', baseColor: 'zinc', accent: 'sky', font: 'geist', radius: 'medium' }),
  clay: theme({ theme: 'clay', baseColor: 'taupe', accent: 'rose', font: 'figtree', radius: 'medium', menuAccent: 'bold' }),
  mono: theme({ theme: 'mono', baseColor: 'neutral', accent: 'amber', font: 'geist-mono', radius: 'none', motion: 'snappy' }),
  tint: theme({ theme: 'tint', baseColor: 'mauve', accent: 'fuchsia', font: 'figtree', radius: 'default' }),
  nova: theme({ theme: 'nova', baseColor: 'zinc', accent: 'indigo', font: 'dm-sans', radius: 'default' }),
  luma: theme({ theme: 'luma', baseColor: 'mist', accent: 'cyan', font: 'nunito-sans', radius: 'large' }),
  mira: theme({ theme: 'mira', baseColor: 'neutral', accent: 'emerald', font: 'ibm-plex-sans', radius: 'small', density: 'compact' }),
  sera: theme({ theme: 'sera', baseColor: 'taupe', accent: 'red', font: 'source-sans-3', fontHeading: 'playfair-display', radius: 'none' }),
};

export interface ThemeInfo {
  label: string;
  /** own: Ivorie's. classic: shadcn/ui's. legacy: works, hidden from pickers, leaves in 2.0. */
  group: 'own' | 'classic' | 'legacy';
  /** One word under the name in a picker. */
  tag: string;
  /** One line: what the theme is. shadcn/ui's words for its eight. */
  note: string;
}

/** Every theme with a CSS file, legacy included, in picker order. */
export const THEME_INFO: Record<string, ThemeInfo> = {
  slate: { label: 'Slate', group: 'own', tag: 'Matte', note: 'Matte solid panes, lit edges, pressed-in fields. Was graphite in 1.5.' },
  glass: { label: 'Glass', group: 'own', tag: 'Frosted', note: 'Frosted neutral glass, edges drawn with light.' },
  bento: { label: 'Bento', group: 'own', tag: 'Tiles', note: 'Tonal tiles, no outlines.' },
  midnight: { label: 'Midnight', group: 'own', tag: 'Dark', note: 'Deep panes and hairlines; the accent shows as light.' },
  clay: { label: 'Clay', group: 'own', tag: 'Warm', note: 'Warm tiles with a fine rim; the chosen item takes the accent.' },
  mono: { label: 'Mono', group: 'own', tag: 'Terminal', note: 'A terminal: square, flat and dense.' },
  tint: { label: 'Tint', group: 'own', tag: 'Washed', note: 'Every surface carries a wash of the accent.' },
  nova: { label: 'Nova', group: 'classic', tag: 'Compact', note: 'Less padding and margin.' },
  luma: { label: 'Luma', group: 'classic', tag: 'Soft', note: 'Fluid, luminous and soft.' },
  mira: { label: 'Mira', group: 'classic', tag: 'Dense', note: 'Made for compact interfaces.' },
  sera: { label: 'Sera', group: 'classic', tag: 'Editorial', note: 'Editorial and typographic.' },
  vega: { label: 'Vega', group: 'legacy', tag: 'Classic', note: 'Clean, neutral and familiar.' },
  maia: { label: 'Maia', group: 'legacy', tag: 'Rounded', note: 'Rounded, with generous spacing.' },
  rhea: { label: 'Rhea', group: 'legacy', tag: 'Soft', note: 'Like Luma, but compact.' },
  lyra: { label: 'Lyra', group: 'legacy', tag: 'Boxy', note: 'Boxy and sharp. For mono fonts.' },
};

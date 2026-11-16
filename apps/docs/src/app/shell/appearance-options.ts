// Style choices for the docs: Ivorie's own five first (glass, the site default, leads), then shadcn's eight in shadcn's order. The style picker shows only when there is more than one.
export const STYLES = [
  { name: 'glass', label: 'Glass', own: true },
  { name: 'graphite', label: 'Graphite', own: true },
  { name: 'tint', label: 'Tint', own: true },
  { name: 'mono', label: 'Mono', own: true },
  { name: 'bento', label: 'Bento', own: true },
  { name: 'vega', label: 'Vega', own: false },
  { name: 'nova', label: 'Nova', own: false },
  { name: 'maia', label: 'Maia', own: false },
  { name: 'luma', label: 'Luma', own: false },
  { name: 'rhea', label: 'Rhea', own: false },
  { name: 'lyra', label: 'Lyra', own: false },
  { name: 'mira', label: 'Mira', own: false },
  { name: 'sera', label: 'Sera', own: false },
] as const;
export type StyleName = (typeof STYLES)[number]['name'];
/** The font a style is made for. The playground picks it when you switch to that style. */
export const STYLE_FONTS: Partial<Record<StyleName, string>> = { mono: 'geist-mono' };
/**
 * The colors a style is shown in: a base color and an accent, so each style reads like a known theme
 * (glass the site's own violet, nova Linear's indigo, maia warm terracotta, sera editorial red, bento coffee-house green,
 * mono a terminal). Shadcn's own accents and base colors, so every look stays one `--preset` away.
 * The docs start in glass's; switching style brings its colors unless you picked colors yourself.
 * Graphite stays grey. `ivorie init` is not affected.
 */
export const STYLE_COLORS: Record<StyleName, { baseColor: string; theme: string }> = {
  glass: { baseColor: 'neutral', theme: 'violet' },
  vega: { baseColor: 'neutral', theme: 'blue' },
  nova: { baseColor: 'zinc', theme: 'indigo' },
  maia: { baseColor: 'stone', theme: 'orange' },
  luma: { baseColor: 'mist', theme: 'cyan' },
  rhea: { baseColor: 'mauve', theme: 'rose' },
  lyra: { baseColor: 'zinc', theme: 'lime' },
  mira: { baseColor: 'neutral', theme: 'teal' },
  sera: { baseColor: 'taupe', theme: 'red' },
  bento: { baseColor: 'olive', theme: 'green' },
  mono: { baseColor: 'neutral', theme: 'emerald' },
  graphite: { baseColor: 'zinc', theme: 'base' },
  tint: { baseColor: 'mauve', theme: 'purple' },
};
/** Matches `<body class="style-glass">` in index.html, the server default. tools/docs/build.ts reads that class for the site CSS. */
export const DEFAULT_STYLE: StyleName = 'glass';

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
 * The colors a style is shown in: a base color and an accent, one hue family per style around the wheel, each echoing
 * a known look (glass the site's own violet, graphite Vercel's monochrome, tint Catppuccin, mono an amber terminal,
 * bento nature green, nova Linear's indigo, maia Claude's terracotta, rhea Rosé Pine, lyra citrus, mira Supabase,
 * sera editorial red). Shadcn's own accents and base colors, so every look stays one `--preset` away.
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
  lyra: { baseColor: 'zinc', theme: 'yellow' },
  mira: { baseColor: 'neutral', theme: 'emerald' },
  sera: { baseColor: 'taupe', theme: 'red' },
  bento: { baseColor: 'olive', theme: 'green' },
  mono: { baseColor: 'neutral', theme: 'amber' },
  graphite: { baseColor: 'zinc', theme: 'base' },
  tint: { baseColor: 'mauve', theme: 'fuchsia' },
};
/** Matches `<body class="style-glass">` in index.html, the server default. tools/docs/build.ts reads that class for the site CSS. */
export const DEFAULT_STYLE: StyleName = 'glass';

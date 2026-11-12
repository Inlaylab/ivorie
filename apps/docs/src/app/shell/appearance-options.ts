// Style choices for the docs: shadcn's eight in shadcn's order, then Ivorie's own (tools/styles/own). The style picker shows only when there is more than one.
export const STYLES = [
  { name: 'vega', label: 'Vega', own: false },
  { name: 'nova', label: 'Nova', own: false },
  { name: 'maia', label: 'Maia', own: false },
  { name: 'luma', label: 'Luma', own: false },
  { name: 'rhea', label: 'Rhea', own: false },
  { name: 'lyra', label: 'Lyra', own: false },
  { name: 'mira', label: 'Mira', own: false },
  { name: 'sera', label: 'Sera', own: false },
  { name: 'glass', label: 'Glass', own: true },
  { name: 'bento', label: 'Bento', own: true },
  { name: 'mono', label: 'Mono', own: true },
] as const;
export type StyleName = (typeof STYLES)[number]['name'];
/** The font a style is made for. The playground picks it when you switch to that style. */
export const STYLE_FONTS: Partial<Record<StyleName, string>> = { mono: 'geist-mono' };
/** Matches `<body class="style-nova">` in index.html, the server default. */
export const DEFAULT_STYLE: StyleName = 'nova';

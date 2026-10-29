// Style choices for the docs, in shadcn's order. The style picker shows only when there is more than one.
export const STYLES = [
  { name: 'vega', label: 'Vega' },
  { name: 'nova', label: 'Nova' },
  { name: 'maia', label: 'Maia' },
  { name: 'luma', label: 'Luma' },
  { name: 'rhea', label: 'Rhea' },
] as const;
export type StyleName = (typeof STYLES)[number]['name'];
/** Matches `<body class="style-maia">` in index.html, the server default. */
export const DEFAULT_STYLE: StyleName = 'maia';

// Icon shapes from Lucide, copied for the icons Ivorie components use. ISC license, https://lucide.dev/license:
// Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
// All other copyright (c) for Lucide are held by Lucide Contributors 2022.
// Shipping them here keeps @lucide/angular (one 10 MB file) out of apps: dev servers do not tree-shake it.

/** Same shape as Lucide's `IconNode`, so icons from the `lucide` package fit as they are. */
export type IconNode = readonly (readonly [tag: string, attrs: Readonly<Record<string, string | number | undefined>>])[]

/** Lucide's `<svg>` attributes: 24px grid, 2px round stroke, currentColor. */
export const LUCIDE_SVG = {
  'viewBox': '0 0 24 24',
  'fill': 'none',
  'stroke': 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
} as const

export const ICONS = {
  'arrow-left': [['path', { d: 'm12 19-7-7 7-7' }], ['path', { d: 'M19 12H5' }]],
  'arrow-right': [['path', { d: 'M5 12h14' }], ['path', { d: 'm12 5 7 7-7 7' }]],
  'check': [['path', { d: 'M20 6 9 17l-5-5' }]],
  'chevron-down': [['path', { d: 'm6 9 6 6 6-6' }]],
  'chevron-left': [['path', { d: 'm15 18-6-6 6-6' }]],
  'chevron-right': [['path', { d: 'm9 18 6-6-6-6' }]],
  'chevron-up': [['path', { d: 'm18 15-6-6-6 6' }]],
  'circle-alert': [['circle', { cx: '12', cy: '12', r: '10' }], ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }], ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }]],
  'circle-check': [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'm16 9-5.5 5.5L8 12' }]],
  'ellipsis': [['circle', { cx: '12', cy: '12', r: '1' }], ['circle', { cx: '19', cy: '12', r: '1' }], ['circle', { cx: '5', cy: '12', r: '1' }]],
  'grip-vertical': [['circle', { cx: '9', cy: '12', r: '1' }], ['circle', { cx: '9', cy: '5', r: '1' }], ['circle', { cx: '9', cy: '19', r: '1' }], ['circle', { cx: '15', cy: '12', r: '1' }], ['circle', { cx: '15', cy: '5', r: '1' }], ['circle', { cx: '15', cy: '19', r: '1' }]],
  'info': [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'M12 16v-4' }], ['path', { d: 'M12 8h.01' }]],
  'loader-circle': [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }]],
  'minus': [['path', { d: 'M5 12h14' }]],
  'panel-left': [['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }], ['path', { d: 'M9 3v18' }]],
  'search': [['path', { d: 'm21 21-4.34-4.34' }], ['circle', { cx: '11', cy: '11', r: '8' }]],
  'triangle-alert': [['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }], ['path', { d: 'M12 9v4' }], ['path', { d: 'M12 17h.01' }]],
  'x': [['path', { d: 'M18 6 6 18' }], ['path', { d: 'm6 6 12 12' }]],
} satisfies Record<string, IconNode>

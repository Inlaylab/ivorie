// Tabler Icons (MIT, https://tabler.io/icons), shapes via @ng-icons/tabler-icons.
// The icons Ivorie components draw. Use: providers: [provideIvIcons(COMPONENT_ICONS)].
// Shapes copied from @ng-icons. For any other icon, use <ng-icon> from @ng-icons/core.
import type { IconData, IconSet, IconSvg } from '@inlaylab/ivorie/icon'

const SVG: IconSvg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }
const ArrowLeftIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M5 12l14 0' }], ['path', { d: 'M5 12l6 6' }], ['path', { d: 'M5 12l6 -6' }]] }
const ArrowRightIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M5 12l14 0' }], ['path', { d: 'M13 18l6 -6' }], ['path', { d: 'M13 6l6 6' }]] }
const CheckIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M5 12l5 5l10 -10' }]] }
const ChevronDownIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M6 9l6 6l6 -6' }]] }
const ChevronLeftIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M15 6l-6 6l6 6' }]] }
const ChevronRightIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M9 6l6 6l-6 6' }]] }
const ChevronUpIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M6 15l6 -6l6 6' }]] }
const ChevronsUpDownIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M8 9l4 -4l4 4' }], ['path', { d: 'M16 15l-4 4l-4 -4' }]] }
const ChevronsLeftIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M11 7l-5 5l5 5' }], ['path', { d: 'M17 7l-5 5l5 5' }]] }
const ChevronsRightIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M7 7l5 5l-5 5' }], ['path', { d: 'M13 7l5 5l-5 5' }]] }
const CircleAlertIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' }], ['path', { d: 'M12 9v4' }], ['path', { d: 'M12 16v.01' }]] }
const CircleCheckIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' }], ['path', { d: 'M9 12l2 2l4 -4' }]] }
const EllipsisIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }], ['path', { d: 'M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }], ['path', { d: 'M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }]] }
const GripVerticalIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M8 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }], ['path', { d: 'M8 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }], ['path', { d: 'M8 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }], ['path', { d: 'M14 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }], ['path', { d: 'M14 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }], ['path', { d: 'M14 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' }]] }
const InfoIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0' }], ['path', { d: 'M12 9h.01' }], ['path', { d: 'M11 12h1v4h1' }]] }
const LoaderCircleIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M12 6l0 -3' }], ['path', { d: 'M16.25 7.75l2.15 -2.15' }], ['path', { d: 'M18 12l3 0' }], ['path', { d: 'M16.25 16.25l2.15 2.15' }], ['path', { d: 'M12 18l0 3' }], ['path', { d: 'M7.75 16.25l-2.15 2.15' }], ['path', { d: 'M6 12l-3 0' }], ['path', { d: 'M7.75 7.75l-2.15 -2.15' }]] }
const MinusIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M5 12l14 0' }]] }
const PanelLeftIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12' }], ['path', { d: 'M9 4l0 16' }]] }
const SearchIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0' }], ['path', { d: 'M21 21l-6 -6' }]] }
const TriangleAlertIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M12 9v4' }], ['path', { d: 'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0' }], ['path', { d: 'M12 16h.01' }]] }
const XIcon: IconData = { svg: SVG, nodes: [['path', { d: 'M18 6l-12 12' }], ['path', { d: 'M6 6l12 12' }]] }

/** The icons the components draw. Use with provideIvIcons(COMPONENT_ICONS). */
export const COMPONENT_ICONS: IconSet = {
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  check: CheckIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-up': ChevronUpIcon,
  'chevrons-left': ChevronsLeftIcon,
  'chevrons-right': ChevronsRightIcon,
  'chevrons-up-down': ChevronsUpDownIcon,
  'circle-alert': CircleAlertIcon,
  'circle-check': CircleCheckIcon,
  ellipsis: EllipsisIcon,
  'grip-vertical': GripVerticalIcon,
  info: InfoIcon,
  'loader-circle': LoaderCircleIcon,
  minus: MinusIcon,
  'panel-left': PanelLeftIcon,
  search: SearchIcon,
  'triangle-alert': TriangleAlertIcon,
  x: XIcon,
}

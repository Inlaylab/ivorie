import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'
import { IV_CARTESIAN } from './cartesian'
import { ivNumber, ivPolarPoint, ivSideAnchor } from './scales'
import { IV_SERIES, IvSeriesItem } from './types'

/**
 * `outside` is for sectors (pie, radial bar); on bars and points it acts like `top`.
 * `insideStart` is for radial bars: the text runs along the ring from the bar's start.
 * On sectors, every other position is the centroid.
 */
export type IvLabelPosition = 'top' | 'inside' | 'insideLeft' | 'right' | 'outside' | 'insideStart'

/** Recharts' label formatter. `any`, so `(value: number) => …` binds without a cast. */
export type IvLabelFormatter = (value: any) => string

interface Label {
  index: number
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
  dy: string | null
  text: string
  /** `insideStart`: the arc the text follows (Recharts' radial label). */
  path?: string
}

/** Recharts' vertical anchors as SVG `dy`: one line of text. */
const DY = { start: '0.71em', middle: '0.355em', end: null } as const

/**
 * Places a label like Recharts' cartesian `Label`. The rect is signed: a negative bar's
 * "top" is its tip, so its `top` label sits under it.
 */
function place(
  item: IvSeriesItem,
  position: IvLabelPosition,
  offset: number,
  flipX: boolean,
  flipY: boolean,
) {
  const sx = flipX ? -1 : 1
  const sy = flipY ? -1 : 1
  const x = flipX ? item.x + item.width : item.x
  const y = flipY ? item.y + item.height : item.y
  const w = sx * item.width
  const h = sy * item.height
  const start = sx > 0 ? 'start' : 'end'
  switch (position) {
    case 'inside':
      return { x: x + w / 2, y: y + h / 2, anchor: 'middle', dy: DY.middle } as const
    case 'insideLeft':
      return { x: x + sx * offset, y: y + h / 2, anchor: start, dy: DY.middle } as const
    case 'right':
      return { x: x + w + sx * offset, y: y + h / 2, anchor: start, dy: DY.middle } as const
    default:
      return {
        x: x + w / 2,
        y: y - sy * offset,
        anchor: 'middle',
        dy: sy > 0 ? DY.end : DY.start,
      } as const
  }
}

/** Recharts' polar label: the centroid, or `offset` px beyond the outer radius on the middle angle. */
function placePolar(item: IvSeriesItem, position: IvLabelPosition, offset: number) {
  if (position !== 'outside')
    return { x: item.x, y: item.y, anchor: 'middle', dy: DY.middle } as const
  const cx = item.cx ?? 0
  const { x, y } = ivPolarPoint(
    cx,
    item.cy ?? 0,
    (item.outerRadius ?? 0) + offset,
    item.midAngle ?? 0,
  )
  return { x, y, anchor: ivSideAnchor(x, cx), dy: DY.middle } as const
}

/**
 * Recharts' `insideStart` radial label: a near-full circle on the ring's middle radius, from
 * `offset` degrees past the start angle, in the bar's direction. The text follows it.
 */
function radialPath(item: IvSeriesItem, offset: number): string {
  const cx = item.cx ?? 0
  const cy = item.cy ?? 0
  const r = ((item.innerRadius ?? 0) + (item.outerRadius ?? 0)) / 2
  const start = item.startAngle ?? 0
  const sign = (item.endAngle ?? 0) - start >= 0 ? 1 : -1
  const angle = start + sign * offset
  const a = ivPolarPoint(cx, cy, r, angle)
  const b = ivPolarPoint(cx, cy, r, angle + sign * 359)
  // Recharts angles grow counter-clockwise: sweep flag 0 when they grow.
  return `M${a.x},${a.y}A${r},${r},0,1,${sign > 0 ? 0 : 1},${b.x},${b.y}`
}

/**
 * Text labels for each item of the series it sits in: `g[ivBar]`, `g[ivLine]`, `g[ivArea]`,
 * `g[ivPie]`, `g[ivRadialBar]`, `g[ivRadar]`.
 */
@Component({
  selector: 'g[ivLabelList]',
  host: { 'data-slot': 'chart-label-list', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (label of labels(); track label.index) {
      @if (label.path) {
        <svg:text dominant-baseline="central">
          <svg:defs><svg:path [attr.id]="id + '-' + label.index" [attr.d]="label.path" /></svg:defs>
          <svg:textPath [attr.href]="'#' + id + '-' + label.index">{{ label.text }}</svg:textPath>
        </svg:text>
      } @else {
        <svg:text
          [attr.x]="label.x"
          [attr.y]="label.y"
          [attr.text-anchor]="label.anchor"
          [attr.dy]="label.dy"
        >
          {{ label.text }}
        </svg:text>
      }
    }
  `,
})
export class IvLabelList {
  /** Row key of the label text. Default: the series' key. */
  readonly dataKey = input<string>()
  readonly position = input<IvLabelPosition>('top')
  /** Distance from the item: px, or degrees for `insideStart`. Default: 5 px, or 5° for `insideStart` (Recharts). */
  readonly offset = input<number>()
  readonly formatter = input<IvLabelFormatter>()
  readonly class = input('')

  private readonly series = inject(IV_SERIES)
  /** Prefix of the `insideStart` path ids. */
  protected readonly id = inject(IvIdGenerator).next('chart-label')
  private readonly cartesian = inject(IV_CARTESIAN, { optional: true })

  protected readonly labels = computed<Label[]>(() => {
    const key = this.dataKey() ?? this.series.key
    const format = this.formatter()
    const position = this.position()
    const offset = ivNumber(this.offset()) ?? 5
    const vertical = this.cartesian?.layout() === 'vertical'
    const labels: Label[] = []
    for (const item of this.series.items()) {
      const value = item.payload[key]
      if (value === null || value === undefined) continue
      // Only a bar (an item with a size) has a direction to flip.
      const negative = (ivNumber(item.value) ?? 0) < 0 && (item.width > 0 || item.height > 0)
      const text = format ? format(value) : String(value)
      if (
        position === 'insideStart' &&
        item.midAngle !== undefined &&
        item.startAngle !== undefined
      ) {
        const path = radialPath(item, offset)
        labels.push({ index: item.index, x: 0, y: 0, anchor: 'start', dy: null, text, path })
        continue
      }
      const at =
        item.midAngle === undefined
          ? place(item, position, offset, negative && vertical, negative && !vertical)
          : placePolar(item, position, offset)
      labels.push({ index: item.index, ...at, text })
    }
    return labels
  })

  protected readonly classes = computed(() =>
    cn('iv-chart-label-list fill-muted-foreground', this.class()),
  )
}

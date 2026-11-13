import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
} from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { pie } from 'd3-shape'
import { cn } from '@inlaylab/ivorie/core'
import { IV_POLAR } from './polar'
import { IvChartLabel, ivArc, ivLabelContext } from './chart-label'
import {
  RADIAN,
  ivNumber,
  ivPercent,
  ivPolarPoint,
  ivSeriesProvider,
  ivSideAnchor,
  ivTemplateAttribute,
} from './scales'
import { IV_CHART, IvChartDatum, IvSeriesItem, ivSeriesColor } from './types'
import { IvActiveShape, IvActiveShapeProps } from './active-shape'

/** A sector's label, given to a custom `label` template as `$implicit`. */
export interface IvPieLabel {
  /** Where the label goes: 20px outside the sector, on its middle angle. */
  x: number
  y: number
  textAnchor: 'start' | 'middle' | 'end'
  dominantBaseline: 'central'
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  value: unknown
  name: unknown
  /** The sector's share of the total, 0–1. */
  percent: number
  index: number
  fill: string
  payload: IvChartDatum
}

export interface IvPieLabelContext {
  $implicit: IvPieLabel
}

/** Recharts' label distance outside the sector. */
const LABEL_OFFSET = 20

interface Sector {
  item: IvSeriesItem
  /** For an `ivActiveShape` template. */
  shape: IvActiveShapeProps
  d: string
  label: IvPieLabel
  line: string
}

interface Row {
  row: IvChartDatum
  index: number
  value: number
}

/** Entrance: fade and scale in from the shape's own center. Off under reduced motion. */
const ENTER_CLASSES = 'motion-safe:animate-chart-in origin-center [transform-box:fill-box]'

/**
 * A sector per row, in data order from `startAngle`. Rows with a `null` or missing value are
 * skipped; a pie whose values sum to 0 draws nothing.
 */
@Component({
  selector: 'g[ivPie]',
  host: { 'data-slot': 'chart-pie', '[class]': 'classes()' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ivSeriesProvider(IvPie)],
  template: `
    @for (s of sectors(); track s.item.index) {
      @if (s.item.index === active() && activeShape(); as shape) {
        <ng-container
          [ngTemplateOutlet]="shape.template"
          [ngTemplateOutletContext]="{ $implicit: s.shape }"
        />
      } @else {
        <svg:path
          data-slot="chart-pie-sector"
          [attr.class]="sectorClass()"
          [attr.d]="s.d"
          [attr.fill]="s.item.fill"
          [attr.stroke]="stroke() ?? null"
          [attr.stroke-width]="strokeWidth()"
          [attr.data-active]="s.item.index === active() ? '' : null"
        />
      }
    }
    @if (label()) {
      @for (s of sectors(); track s.item.index) {
        @if (labelLine()) {
          <svg:path
            data-slot="chart-pie-label-line"
            fill="none"
            [attr.d]="s.line"
            [attr.stroke]="s.item.fill"
          />
        }
        @if (labelTemplate(); as tpl) {
          <ng-container
            [ngTemplateOutlet]="tpl"
            [ngTemplateOutletContext]="{ $implicit: s.label }"
          />
        } @else {
          <svg:text
            data-slot="chart-pie-label"
            dominant-baseline="central"
            [attr.x]="s.label.x"
            [attr.y]="s.label.y"
            [attr.text-anchor]="s.label.textAnchor"
            [attr.fill]="s.item.fill"
          >
            {{ s.label.value }}
          </svg:text>
        }
      }
    }
    <ng-content />
    @if (chartLabel(); as l) {
      <ng-container [ngTemplateOutlet]="l.template" [ngTemplateOutletContext]="labelContext()" />
    }
  `,
})
export class IvPie {
  /** Rows for this pie. Default: the chart's `data`. */
  readonly data = input<readonly IvChartDatum[]>()
  readonly dataKey = input.required<string>()
  /** Row key of the sector name. Its color is `var(--color-<name>)` unless the row has a `fill`. */
  readonly nameKey = input('name')
  /** px or a percent of the largest radius. Default: the chart's. */
  readonly innerRadius = input<number | string>()
  readonly outerRadius = input<number | string>()
  /** Degrees between sectors. */
  readonly paddingAngle = input(0)
  /** Sector outline color. Default: none (shadcn hides the outline). */
  readonly stroke = input<string>()
  readonly strokeWidth = input(1)
  /**
   * The highlighted sector (`data-active`, or the `ivActiveShape` template). Default: the
   * sector under the cursor, in this ring.
   */
  readonly activeIndex = input<number>()
  /** Value labels outside the sectors, or a template given `IvPieLabel`. */
  readonly label = input(false, { transform: ivTemplateAttribute<IvPieLabelContext> })
  /** A line from each sector to its label. */
  readonly labelLine = input(true, { transform: booleanAttribute })
  readonly class = input('')

  private readonly ctx = inject(IV_POLAR)
  private readonly chart = inject(IV_CHART)
  private readonly el = inject<ElementRef<Element>>(ElementRef).nativeElement
  protected readonly chartLabel = contentChild(IvChartLabel)
  protected readonly activeShape = contentChild(IvActiveShape)

  constructor() {
    effect((onCleanup) => {
      onCleanup(
        this.ctx.register({
          key: this.dataKey(),
          kind: 'pie',
          el: this.el,
          items: this.items,
          nameKey: this.nameKey(),
        }),
      )
    })
  }

  private readonly rows = computed(() => this.data() ?? this.ctx.data())

  private readonly radius = computed(() => {
    const max = this.ctx.maxRadius()
    const root = this.ctx.radius()
    const inner = this.innerRadius()
    const outer = this.outerRadius()
    return {
      inner: inner === undefined ? root.inner : ivPercent(inner, max, Infinity),
      outer: outer === undefined ? root.outer : ivPercent(outer, max, Infinity),
    }
  })

  protected readonly sectors = computed<Sector[]>(() => {
    const key = this.dataKey()
    const nameKey = this.nameKey()
    const { cx, cy } = this.ctx.center()
    const { inner, outer } = this.radius()
    const { start, end } = this.ctx.angles()
    const rows: Row[] = []
    this.rows().forEach((row, index) => {
      const value = ivNumber(row[key])
      if (value !== undefined) rows.push({ row, index, value: Math.max(0, value) })
    })
    const total = rows.reduce((sum, r) => sum + r.value, 0)
    if (total <= 0) return []
    // d3 angles: radians, 0 at 12 o'clock, clockwise. Recharts degrees: 0 at 3 o'clock, counter-clockwise.
    const arcs = pie<Row>()
      .sort(null)
      .value((r) => r.value)
      .startAngle((90 - start) * RADIAN)
      .endAngle((90 - end) * RADIAN)
      .padAngle(Math.max(0, ivNumber(this.paddingAngle()) ?? 0) * RADIAN)(rows)
    const sectors: Sector[] = []
    for (const a of arcs) {
      if (a.value <= 0) continue
      const { row, index, value } = a.data
      // d3 puts the padding inside each arc; Recharts draws the gap as angle between sectors.
      const half = (Math.sign(a.endAngle - a.startAngle) * a.padAngle) / 2
      const startAngle = 90 - (a.startAngle + half) / RADIAN
      const endAngle = 90 - (a.endAngle - half) / RADIAN
      const midAngle = (startAngle + endAngle) / 2
      const name = row[nameKey]
      const fill =
        typeof row['fill'] === 'string'
          ? row['fill']
          : ivSeriesColor(typeof name === 'string' || typeof name === 'number' ? String(name) : key)
      const centroid = ivPolarPoint(cx, cy, (inner + outer) / 2, midAngle)
      const from = ivPolarPoint(cx, cy, outer, midAngle)
      const to = ivPolarPoint(cx, cy, outer + LABEL_OFFSET, midAngle)
      const sector = {
        cx,
        cy,
        innerRadius: inner,
        outerRadius: outer,
        startAngle,
        endAngle,
        fill,
        index,
      }
      const d = ivArc(sector)
      const item: IvSeriesItem = {
        x: centroid.x,
        y: centroid.y,
        width: 0,
        height: 0,
        value: row[key],
        payload: row,
        ...sector,
        midAngle,
      }
      sectors.push({
        d,
        shape: { ...item, ...sector, d },
        line: `M${from.x},${from.y}L${to.x},${to.y}`,
        item,
        label: {
          x: to.x,
          y: to.y,
          textAnchor: ivSideAnchor(to.x, cx),
          dominantBaseline: 'central',
          cx,
          cy,
          midAngle,
          innerRadius: inner,
          outerRadius: outer,
          value: row[key],
          name,
          percent: value / total,
          index,
          fill,
          payload: row,
        },
      })
    }
    return sectors
  })

  /** One item per drawn sector, for `ivLabelList`. */
  readonly items = computed<IvSeriesItem[]>(() => this.sectors().map((s) => s.item))

  /**
   * `activeIndex`, or the active row when it is in this ring. A row that names no ring
   * (`defaultIndex`, a keyless `active.set`) is the first ring's, as the tooltip shows it.
   */
  protected readonly active = computed(() => {
    const fixed = this.activeIndex()
    if (fixed !== undefined) return fixed
    const active = this.chart.active()
    if (!active) return undefined
    const key = active.key ?? this.ctx.series().find((s) => s.kind === 'pie')?.key
    return key === this.dataKey() ? active.index : undefined
  })

  protected readonly labelTemplate = computed(() => {
    const label = this.label()
    return label instanceof TemplateRef ? label : null
  })

  /** shadcn hides the default outline; an explicit `stroke` shows. */
  protected readonly sectorClass = computed(() =>
    this.stroke() === undefined ? 'iv-chart-sector' : null,
  )

  protected readonly labelContext = ivLabelContext(this.ctx.center, this.radius)

  protected readonly classes = computed(() => cn(ENTER_CLASSES, this.class()))
}

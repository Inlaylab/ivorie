import { InjectionToken, Signal, Type, WritableSignal } from '@angular/core'

/** One series: a label, an optional icon and a color (or a light/dark pair). */
export type IvChartSeries = { label?: string; icon?: Type<unknown> } & (
  | { color?: string; theme?: never }
  | { color?: never; theme: { light: string; dark: string } }
)

/** Series config, keyed by the data key. Each key becomes `--color-<key>`. */
export type IvChartConfig = Record<string, IvChartSeries>

export type IvChartDatum = Record<string, unknown>

export interface IvChartMargin {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface IvChartSize {
  width: number
  height: number
}

/**
 * The highlighted row. `key` names the series when the row belongs to one (a pie ring).
 * `x`, `y` are the pointer in chart px; unset for the keyboard and `defaultIndex`, so the
 * tooltip sits at the row.
 */
export interface IvChartActive {
  index: number
  key?: string
  x?: number
  y?: number
}

/** One row of the tooltip: a series value under the cursor (Recharts' payload item). */
export interface IvChartPayload {
  /** The series' `dataKey`. */
  key: string
  /** The series key, or the sector's `nameKey` value (pie). */
  name: string
  value: unknown
  /** The series color (a pie sector: its fill). */
  color: string
  /** The data row. */
  row: IvChartDatum
}

/** One legend entry: a series, or a pie sector. */
export interface IvChartLegendItem {
  key: string
  name: string
  color: string
  /** Pie sectors: the data row. */
  row?: IvChartDatum
}

/** What a chart root tells the tooltip and legend. Methods read signals: call them in a `computed`. */
export interface IvChartSource {
  /** Rows the active index can point at: the active index is cleared when they shrink below it. */
  rowCount(): number
  /** Tooltip rows for the active item, `[]` when it is gone. */
  payload(active: IvChartActive): IvChartPayload[]
  /** The category value (Recharts' tooltip `label`): the axis key's value, or the row index. */
  activeLabel(active: IvChartActive): unknown
  /** Where the tooltip points: the pointer, or the item. */
  anchor(active: IvChartActive): { x: number; y: number }
  legend(): IvChartLegendItem[]
}

export interface IvChartContext {
  /** Value of `data-chart` on the container. */
  id: string
  config: Signal<IvChartConfig>
  size: Signal<IvChartSize>
  /** The highlighted row, from the pointer, the keyboard or the tooltip's `defaultIndex`. */
  active: WritableSignal<IvChartActive | null>
  /** Rows under the cursor, for the tooltip. */
  payload: Signal<IvChartPayload[]>
  /** The chart root, once it is there. */
  source: Signal<IvChartSource | undefined>
  /** Space the legend takes above and below the plot, in px. */
  reserve: Signal<{ top: number; bottom: number }>
  /** A tooltip with `cursor` is present. */
  cursor: Signal<boolean>
  /** The chart root has focus: the tooltip is a live region. */
  focused: WritableSignal<boolean>
}

/** Recharts' formatter. `any`, so `(value: string) => …` binds without a cast. */
export type IvTickFormatter = (value: any, index: number) => string

export const IV_CHART = new InjectionToken<IvChartContext>('IV_CHART')

/** The CSS color of a series: `var(--color-<key>)`. */
export function ivSeriesColor(key: string): string {
  return `var(--color-${key})`
}

/** The label of a series, or its key when the config has none. */
export function ivSeriesLabel(config: IvChartConfig, key: string): string {
  return config[key]?.label ?? key
}

/**
 * One drawn item of a series (a point, a bar or a sector), for labels.
 * Line and area: `x`, `y` are the point's center, `width` and `height` are 0.
 * Bar: `x`, `y` are the top-left corner of the rect, `width` and `height` are its size.
 * Sector: `x`, `y` are its centroid, `width` and `height` are 0, and the polar fields are set.
 */
export interface IvSeriesItem {
  index: number
  x: number
  y: number
  width: number
  height: number
  /** The series value of the row. */
  value: unknown
  fill: string
  /** The data row. */
  payload: IvChartDatum
  /**
   * Sectors (pie, radial bar) only: center, radii and angles. Angles are degrees, Recharts'
   * convention: 0 is 3 o'clock, positive is counter-clockwise. `x`, `y` are then the centroid.
   */
  cx?: number
  cy?: number
  innerRadius?: number
  outerRadius?: number
  startAngle?: number
  endAngle?: number
  midAngle?: number
}

/** What a series part provides through `IV_SERIES`. */
export interface IvSeriesContext {
  key: string
  /** The drawn items. Gap rows have no item. */
  items: Signal<IvSeriesItem[]>
}

/** Provided by each series part: its key and its drawn items. */
export const IV_SERIES = new InjectionToken<IvSeriesContext>('IV_SERIES')

/** What the chart reads from a d3 band or point scale. Our own shape, so the published types need no d3. */
export interface IvCategoryScale {
  (value: string): number | undefined
  bandwidth(): number
  step(): number
}

/** What the chart reads from a d3 linear scale. */
export interface IvValueScale {
  (value: number): number
  ticks(count?: number): number[]
  domain(): number[]
}

/** Recharts curve names. */
export type IvCurve = 'natural' | 'linear' | 'step' | 'monotone' | 'bump'

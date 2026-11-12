import { Directive, Signal, TemplateRef, computed, inject } from '@angular/core'
import { arc } from 'd3-shape'
import { RADIAN } from './scales'

/** A sector in pixels. Angles are degrees, Recharts' convention: 0 is 3 o'clock, positive is counter-clockwise. */
export interface IvSectorShape {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  index: number
}

/** `n`, or `fallback` when it is `NaN` or infinite. */
export function ivFinite(n: number, fallback = 0): number {
  return Number.isFinite(n) ? n : fallback
}

const round = (n: number) => Math.round(n * 1000) / 1000

/** Moves an absolute `M`/`L`/`A`/`Z` path (d3-path output) by `dx`, `dy`. */
function translate(d: string, dx: number, dy: number): string {
  return d.replace(/([MLA])([^MLAZ]+)/g, (_, cmd: string, args: string) => {
    const n = args.split(',').map(Number)
    const at = cmd === 'A' ? 5 : 0
    n[at] += dx
    n[at + 1] += dy
    return cmd + n.map(round).join(',')
  })
}

/**
 * The SVG path of a sector (Recharts' Sector). `cornerRadius` rounds its corners; d3 caps it to fit.
 * Bad numbers draw as 0, so the path never holds `NaN`.
 */
export function ivArc(shape: IvSectorShape, cornerRadius = 0): string {
  const inner = Math.max(0, ivFinite(shape.innerRadius))
  const outer = Math.max(inner, ivFinite(shape.outerRadius))
  // d3 angles: radians, 0 at 12 o'clock, clockwise.
  const d =
    arc().cornerRadius(Math.max(0, ivFinite(cornerRadius)))({
      innerRadius: inner,
      outerRadius: outer,
      startAngle: (90 - ivFinite(shape.startAngle)) * RADIAN,
      endAngle: (90 - ivFinite(shape.endAngle)) * RADIAN,
    }) ?? ''
  return translate(d, ivFinite(shape.cx), ivFinite(shape.cy))
}

/** The polar box a center label is placed in. */
export interface IvPolarViewBox {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
}

/** `let-box` gives the whole box; `let-cx="cx"` and friends give one field. */
export interface IvChartLabelContext extends IvPolarViewBox {
  $implicit: IvPolarViewBox
}

/** The `ivChartLabel` context for a center and radii: `$implicit` is the box, its fields are spread too. */
export function ivLabelContext(
  center: Signal<{ cx: number; cy: number }>,
  radius: Signal<{ inner: number; outer: number }>,
): Signal<IvChartLabelContext> {
  return computed(() => {
    const { cx, cy } = center()
    const { inner, outer } = radius()
    const box: IvPolarViewBox = { cx, cy, innerRadius: inner, outerRadius: outer }
    return { $implicit: box, ...box }
  })
}

/**
 * Center content (donut total, gauge value), rendered in the SVG. Put it inside `g[ivPie]`,
 * `g[ivRadialBar]` or `g[ivPolarRadiusAxis]`.
 */
@Directive({ selector: 'ng-template[ivChartLabel]' })
export class IvChartLabel {
  readonly template = inject<TemplateRef<IvChartLabelContext>>(TemplateRef)

  static ngTemplateContextGuard(_dir: IvChartLabel, ctx: unknown): ctx is IvChartLabelContext {
    return true
  }
}

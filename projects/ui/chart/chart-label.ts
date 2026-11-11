import { Directive, TemplateRef, inject } from '@angular/core';
import { arc } from 'd3-shape';
import { RADIAN } from './scales';

/** A sector in pixels. Angles are degrees, Recharts' convention: 0 is 3 o'clock, positive is counter-clockwise. */
export interface IvSectorShape {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  index: number;
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0);
const round = (n: number) => Math.round(n * 1000) / 1000;

/** Moves an absolute `M`/`L`/`A`/`Z` path (d3-path output) by `dx`, `dy`. */
function translate(d: string, dx: number, dy: number): string {
  return d.replace(/([MLA])([^MLAZ]+)/g, (_, cmd: string, args: string) => {
    const n = args.split(',').map(Number);
    const at = cmd === 'A' ? 5 : 0;
    n[at] += dx;
    n[at + 1] += dy;
    return cmd + n.map(round).join(',');
  });
}

/**
 * The SVG path of a sector (Recharts' Sector). `cornerRadius` rounds its corners; d3 caps it to fit.
 * Bad numbers draw as 0, so the path never holds `NaN`.
 */
export function ivArc(shape: IvSectorShape, cornerRadius = 0): string {
  const inner = Math.max(0, finite(shape.innerRadius));
  const outer = Math.max(inner, finite(shape.outerRadius));
  // d3 angles: radians, 0 at 12 o'clock, clockwise.
  const d =
    arc().cornerRadius(Math.max(0, finite(cornerRadius)))({
      innerRadius: inner,
      outerRadius: outer,
      startAngle: (90 - finite(shape.startAngle)) * RADIAN,
      endAngle: (90 - finite(shape.endAngle)) * RADIAN,
    }) ?? '';
  return translate(d, finite(shape.cx), finite(shape.cy));
}

/** The polar box a center label is placed in. */
export interface IvPolarViewBox {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
}

/** `let-box` gives the whole box; `let-cx="cx"` and friends give one field. */
export interface IvChartLabelContext extends IvPolarViewBox {
  $implicit: IvPolarViewBox;
}

/**
 * Center content (donut total, gauge value), rendered in the SVG. Put it inside `g[ivPie]`,
 * `g[ivRadialBar]` or `g[ivPolarRadiusAxis]`.
 */
@Directive({ selector: 'ng-template[ivChartLabel]' })
export class IvChartLabel {
  readonly template = inject<TemplateRef<IvChartLabelContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: IvChartLabel, ctx: unknown): ctx is IvChartLabelContext {
    return true;
  }
}

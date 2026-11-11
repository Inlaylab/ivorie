import { ScaleBand, ScalePoint, scaleLinear } from 'd3-scale';
import {
  CurveFactory,
  curveBumpX,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  stack,
  stackOffsetExpand,
  stackOffsetNone,
} from 'd3-shape';
import { IvChartDatum } from './types';

/** Recharts curve names. */
export type IvCurve = 'natural' | 'linear' | 'step' | 'monotone' | 'bump';

const CURVES: Record<IvCurve, CurveFactory> = {
  natural: curveNatural,
  linear: curveLinear,
  step: curveStep,
  monotone: curveMonotoneX,
  bump: curveBumpX,
};

export function ivCurve(curve: IvCurve): CurveFactory {
  return CURVES[curve] ?? curveLinear;
}

/** A finite number, or `undefined` for null, missing or non-numeric values. */
export function ivNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Stacks `keys` in order (the first key is the base). A missing value adds 0 to the
 * stack, so the next key sits on its base, and its own point is `undefined` (a gap).
 */
export function ivStack(
  data: readonly IvChartDatum[],
  keys: string[],
  offset: 'none' | 'expand',
): Map<string, ([number, number] | undefined)[]> {
  const layers = stack<IvChartDatum, string>()
    .keys(keys)
    .value((row, key) => ivNumber(row[key]) ?? 0)
    .offset(offset === 'expand' ? stackOffsetExpand : stackOffsetNone)(data);
  const result = new Map<string, ([number, number] | undefined)[]>();
  for (const layer of layers) {
    result.set(
      layer.key,
      layer.map((point, i) => (ivNumber(data[i][layer.key]) === undefined ? undefined : [point[0], point[1]])),
    );
  }
  return result;
}

/** The value domain over `[low, high]` extents: always includes 0, rounded out to nice ticks. */
export function ivValueDomain(extents: [number, number][]): [number, number] {
  let lo = 0;
  let hi = 0;
  for (const [a, b] of extents) {
    lo = Math.min(lo, a, b);
    hi = Math.max(hi, a, b);
  }
  if (lo === hi) return [0, 1];
  const [min, max] = scaleLinear().domain([lo, hi]).nice(5).domain();
  return [min, max];
}

/** The center of row `index` on a category scale, or `undefined` when it is not in the domain. */
export function ivBandCenter(scale: ScaleBand<string> | ScalePoint<string>, index: number): number | undefined {
  const start = scale(String(index));
  return start === undefined ? undefined : start + scale.bandwidth() / 2;
}

import { Provider, Signal, TemplateRef, Type, booleanAttribute, inject } from '@angular/core';
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
import {
  IV_SERIES,
  IvChartConfig,
  IvChartDatum,
  IvChartSeries,
  IvSeriesContext,
  IvSeriesItem,
} from './types';

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
export function ivValueDomain(extents: [number, number][], tickCount = 5): [number, number] {
  let lo = 0;
  let hi = 0;
  for (const [a, b] of extents) {
    lo = Math.min(lo, a, b);
    hi = Math.max(hi, a, b);
  }
  if (lo === hi) return [0, 1];
  const [min, max] = scaleLinear().domain([lo, hi]).nice(tickCount).domain();
  return [min, max];
}

/** Rounds float noise away (Recharts does this math with decimal.js). */
const exact = (n: number) => Number(n.toPrecision(12));

/** Recharts' getFormatStep: a round step near `rough` (1, 1.5, 2, … × 10^n). */
function niceStep(rough: number, correction: number): number {
  if (!(rough > 0)) return 0;
  const digits = Math.floor(Math.log10(rough)) + 1;
  const unit = 10 ** digits;
  const ratio = exact(rough / unit);
  const scale = digits !== 1 ? 0.05 : 0.1;
  return exact((Math.ceil(exact(ratio / scale)) + correction) * scale * unit);
}

/**
 * Recharts' getNiceTickValues: exactly `count` evenly spaced round ticks that cover `[lo, hi]`,
 * through 0 when the range holds it. The first and last tick are the axis domain.
 */
export function ivNiceTicks(lo: number, hi: number, count = 5, correction = 0): number[] {
  count = Math.max(2, count);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo >= hi) {
    return scaleLinear().domain(lo === hi && Number.isFinite(lo) ? [Math.min(0, lo), Math.max(1, lo)] : [0, 1]).nice(count).ticks(count);
  }
  const step = niceStep((hi - lo) / (count - 1), correction);
  if (!(step > 0)) return [lo, hi];
  let middle = 0;
  if (!(lo <= 0 && hi >= 0)) {
    middle = (lo + hi) / 2;
    middle = exact(middle - (middle % step));
  }
  let below = Math.ceil(exact((middle - lo) / step));
  let up = Math.ceil(exact((hi - middle) / step));
  const total = below + up + 1;
  if (total > count) return ivNiceTicks(lo, hi, count, correction + 1);
  if (total < count) {
    if (hi > 0) up += count - total;
    else below += count - total;
  }
  return Array.from({ length: below + up + 1 }, (_, i) => exact(middle + (i - below) * step));
}

/** The center of row `index` on a category scale, or `undefined` when it is not in the domain. */
export function ivBandCenter(scale: ScaleBand<string> | ScalePoint<string>, index: number): number | undefined {
  const start = scale(String(index));
  return start === undefined ? undefined : start + scale.bandwidth() / 2;
}

/**
 * Recharts' percent value: `'10%'` of `total`, or a plain number. Invalid gives 0.
 * The result is clamped to `[0, max]` (`max` defaults to `total`).
 */
export function ivPercent(value: number | string, total: number, max = total): number {
  const n = typeof value === 'string' && value.trim().endsWith('%') ? (total * parseFloat(value)) / 100 : Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(0, n), max) : 0;
}

/**
 * Where bar slot `index` of `count` sits in a band of `bandSize` (Recharts' getBarPosition):
 * `categoryGap` on each side of the band, `gap` between slots. Sizes over 1px are whole pixels.
 */
export function ivBarPosition(
  bandSize: number,
  count: number,
  index: number,
  gap: number | string,
  categoryGap: number | string,
): { offset: number; size: number } {
  const outer = ivPercent(categoryGap, bandSize);
  let inner = ivPercent(gap, bandSize);
  if (bandSize - 2 * outer - (count - 1) * inner <= 0) inner = 0;
  let size = Math.max(0, (bandSize - 2 * outer - (count - 1) * inner) / Math.max(1, count));
  if (size > 1) size = Math.trunc(size);
  return { offset: outer + (size + inner) * index, size };
}

/** Sorts by the hosts' document position; items without a host keep their place at the end. */
export function ivMarkupOrder<T extends { el?: Element }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.el || !b.el) return a.el ? -1 : b.el ? 1 : 0;
    return a.el.compareDocumentPosition(b.el) & 4 /* Node.DOCUMENT_POSITION_FOLLOWING */ ? -1 : 1;
  });
}

/** Provides `IV_SERIES` from a series part, for `ivLabelList`. */
export function ivSeriesProvider(type: Type<{ dataKey: Signal<string>; items: Signal<IvSeriesItem[]> }>): Provider {
  return {
    provide: IV_SERIES,
    useFactory: (): IvSeriesContext => {
      const series = inject(type);
      return {
        get key() {
          return series.dataKey();
        },
        items: series.items,
      };
    },
  };
}

/** Input transform for `boolean | TemplateRef` inputs: a template stays, anything else is `booleanAttribute`. */
export function ivTemplateAttribute<T>(value: unknown): boolean | TemplateRef<T> {
  return value instanceof TemplateRef ? (value as TemplateRef<T>) : booleanAttribute(value);
}

export const RADIAN = Math.PI / 180;

/** A point at `radius` and `angle` (degrees, Recharts: 0 is 3 o'clock, counter-clockwise) from the center. */
export function ivPolarPoint(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  return { x: cx + Math.cos(-angle * RADIAN) * radius, y: cy + Math.sin(-angle * RADIAN) * radius };
}

/** Recharts' text anchor for a point right of, left of, or in line with the center. */
export function ivSideAnchor(x: number, cx: number): 'start' | 'middle' | 'end' {
  return x > cx + 1e-6 ? 'start' : x < cx - 1e-6 ? 'end' : 'middle';
}

/** The config entry of `key`, or `undefined`. Own keys only, so `'toString'` finds nothing. */
export function ivConfigEntry(config: IvChartConfig, key: string): IvChartSeries | undefined {
  return Object.hasOwn(config, key) ? config[key] : undefined;
}

/**
 * shadcn's `getPayloadConfigFromPayload`: when the item or its row holds a string at `key`,
 * that string names the config entry (a pie's `nameKey` value). Else `key` does.
 */
export function ivPayloadConfig(
  config: IvChartConfig,
  item: object & { row?: IvChartDatum },
  key: string,
): IvChartSeries | undefined {
  const own = (item as Record<string, unknown>)[key];
  const fromRow = item.row?.[key];
  const name = typeof own === 'string' ? own : typeof fromRow === 'string' ? fromRow : key;
  return ivConfigEntry(config, name) ?? ivConfigEntry(config, key);
}

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  InjectionToken,
  Signal,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ScaleBand, ScaleLinear, ScalePoint, scaleLinear, scalePoint } from 'd3-scale';
import { cn } from '@inlaylab/ivorie/core';
import { IV_CHART, IvChartDatum, IvChartMargin, ivSeriesLabel } from './types';
import { ivBandCenter, ivStack, ivValueDomain } from './scales';

export type IvChartLayout = 'horizontal' | 'vertical';
export type IvStackOffset = 'none' | 'expand';

/** A series point in pixels. `x` is along the category axis, `y0`/`y1` along the value axis. */
export interface IvCartesianPoint {
  x: number;
  y0: number;
  y1: number;
}

export interface IvCartesianSeriesRef {
  key: string;
  stackId?: string;
  kind: 'line' | 'area' | 'bar';
  /** The series' host. Stacks follow markup order, which an `@if` or `@for` can differ from registration order. */
  el?: Element;
}

/** The plot area in pixels: the chart size minus margin and axis space. */
export interface IvCartesianPlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IvCartesianContext {
  data: Signal<readonly IvChartDatum[]>;
  layout: Signal<IvChartLayout>;
  plot: Signal<IvCartesianPlot>;
  /** The category axis. Its domain is the row index as a string (`'0'`, `'1'`, …). Null with no rows. */
  category: Signal<{ key: string; scale: ScaleBand<string> | ScalePoint<string> } | null>;
  value: Signal<ScaleLinear<number, number>>;
  /** Adds a series to the stacks and the value domain. Returns the unregister function. */
  register(series: IvCartesianSeriesRef): () => void;
  /** One entry per row; `undefined` is a gap (missing or null value). */
  points(key: string): Signal<(IvCartesianPoint | undefined)[]>;
  /** An axis gives its `dataKey` ('' for a number axis) and the space it takes. Returns the unregister function. */
  setCategory(key: string, axis: 'x' | 'y', reserve: number): () => void;
}

export const IV_CARTESIAN = new InjectionToken<IvCartesianContext>('IV_CARTESIAN');

const MARGIN = 5;
const NO_POINTS: (IvCartesianPoint | undefined)[] = [];

interface AxisRef {
  key: string;
  axis: 'x' | 'y';
  reserve: number;
}

/** Sorts by the hosts' document position; series without a host keep their place at the end. */
function inMarkupOrder(series: IvCartesianSeriesRef[]): IvCartesianSeriesRef[] {
  return [...series].sort((a, b) => {
    if (!a.el || !b.el) return a.el ? -1 : b.el ? 1 : 0;
    return a.el.compareDocumentPosition(b.el) & 4 /* Node.DOCUMENT_POSITION_FOLLOWING */ ? -1 : 1;
  });
}

/** Shared root of the cartesian charts: owns data, margin, stacks and scales. */
@Directive({
  host: {
    'data-slot': 'chart-surface',
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[attr.width]': 'chart.size().width',
    '[attr.height]': 'chart.size().height',
    '[attr.viewBox]': 'viewBox()',
    '[class]': 'classes()',
  },
})
export abstract class IvCartesianChart {
  readonly data = input.required<readonly IvChartDatum[]>();
  readonly margin = input<IvChartMargin>({});
  readonly ariaLabel = input('');
  readonly class = input('');

  /** Used in the default label, e.g. "Area". */
  protected abstract readonly name: string;
  protected readonly layout: Signal<IvChartLayout> = signal('horizontal');
  protected readonly offset: Signal<IvStackOffset> = signal('none');

  protected readonly chart = inject(IV_CHART);
  private readonly series = signal<IvCartesianSeriesRef[]>([]);
  private readonly axes = signal<AxisRef[]>([]);
  private readonly memo = new Map<string, Signal<(IvCartesianPoint | undefined)[]>>();

  /** Category scale for line and area: points with no padding, so the edges touch. Bar overrides. */
  protected categoryScale(domain: string[], range: [number, number]): ScaleBand<string> | ScalePoint<string> {
    return scalePoint<string>().domain(domain).range(range).padding(0);
  }

  private readonly plot = computed<IvCartesianPlot>(() => {
    const { width, height } = this.chart.size();
    const m = this.margin();
    let left = m.left ?? MARGIN;
    let bottom = m.bottom ?? MARGIN;
    for (const a of this.axes()) {
      if (a.axis === 'x') bottom += a.reserve;
      else left += a.reserve;
    }
    const top = m.top ?? MARGIN;
    const right = m.right ?? MARGIN;
    return {
      x: left,
      y: top,
      width: Math.max(0, width - left - right),
      height: Math.max(0, height - top - bottom),
    };
  });

  private readonly category = computed(() => {
    const data = this.data();
    if (!data.length) return null;
    const p = this.plot();
    const side = this.layout() === 'horizontal' ? 'x' : 'y';
    const key = this.axes().find((a) => a.axis === side && a.key)?.key ?? '';
    const range: [number, number] = side === 'x' ? [p.x, p.x + p.width] : [p.y, p.y + p.height];
    return { key, scale: this.categoryScale(data.map((_, i) => String(i)), range) };
  });

  /** Stacked `[y0, y1]` values per series key. Series without a `stackId` start at 0. */
  private readonly stacks = computed(() => {
    const data = this.data();
    const offset = this.offset();
    const groups = new Map<string, string[]>();
    const out = new Map<string, ([number, number] | undefined)[]>();
    for (const s of inMarkupOrder(this.series())) {
      if (s.stackId === undefined) {
        for (const [key, values] of ivStack(data, [s.key], 'none')) out.set(key, values);
      } else {
        groups.set(s.stackId, [...(groups.get(s.stackId) ?? []), s.key]);
      }
    }
    for (const keys of groups.values()) {
      for (const [key, values] of ivStack(data, keys, offset)) out.set(key, values);
    }
    return out;
  });

  private readonly value = computed(() => {
    const extents: [number, number][] = [];
    for (const values of this.stacks().values()) for (const v of values) if (v) extents.push(v);
    const p = this.plot();
    const range = this.layout() === 'horizontal' ? [p.y + p.height, p.y] : [p.x, p.x + p.width];
    return scaleLinear().domain(ivValueDomain(extents)).range(range);
  });

  private readonly pixels = computed(() => {
    const out = new Map<string, (IvCartesianPoint | undefined)[]>();
    const category = this.category();
    if (!category) return out;
    const value = this.value();
    for (const [key, values] of this.stacks()) {
      out.set(
        key,
        values.map((v, i) => {
          const x = ivBandCenter(category.scale, i);
          return v && x !== undefined ? { x, y0: value(v[0]), y1: value(v[1]) } : undefined;
        }),
      );
    }
    return out;
  });

  /** Shared with the parts through `IV_CARTESIAN`. */
  readonly context: IvCartesianContext = {
    data: this.data,
    layout: computed(() => this.layout()),
    plot: this.plot,
    category: this.category,
    value: this.value,
    register: (series) => {
      const entry = { ...series };
      this.series.update((list) => [...list, entry]);
      return () => this.series.update((list) => list.filter((s) => s !== entry));
    },
    points: (key) => {
      let points = this.memo.get(key);
      if (!points) {
        points = computed(() => this.pixels().get(key) ?? NO_POINTS);
        this.memo.set(key, points);
      }
      return points;
    },
    setCategory: (key, axis, reserve) => {
      const entry = { key, axis, reserve };
      this.axes.update((list) => [...list, entry]);
      return () => this.axes.update((list) => list.filter((a) => a !== entry));
    },
  };

  protected readonly label = computed(() => {
    if (this.ariaLabel()) return this.ariaLabel();
    const config = this.chart.config();
    const names = this.series().map((s) => ivSeriesLabel(config, s.key));
    return names.length ? `${this.name} chart: ${names.join(', ')}` : `${this.name} chart`;
  });

  protected readonly viewBox = computed(() => {
    const { width, height } = this.chart.size();
    return `0 0 ${width} ${height}`;
  });

  protected readonly classes = computed(() => cn('overflow-visible', this.class()));
}

@Component({
  selector: 'svg[ivLineChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IV_CARTESIAN, useFactory: () => inject(IvLineChart).context }],
  template: `<ng-content />`,
})
export class IvLineChart extends IvCartesianChart {
  protected readonly name = 'Line';
}

@Component({
  selector: 'svg[ivAreaChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IV_CARTESIAN, useFactory: () => inject(IvAreaChart).context }],
  template: `<ng-content />`,
})
export class IvAreaChart extends IvCartesianChart {
  readonly stackOffset = input<IvStackOffset>('none');
  protected readonly name = 'Area';
  protected override readonly offset = this.stackOffset;
}

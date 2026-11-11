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
import { ScaleBand, ScaleLinear, ScalePoint, scaleBand, scaleLinear, scalePoint } from 'd3-scale';
import { cn } from '@inlaylab/ivorie/core';
import {
  IvChartActive,
  IvChartDatum,
  IvChartLegendItem,
  IvChartMargin,
  IvChartPayload,
  ivSeriesLabel,
} from './types';
import { ivBandCenter, ivMarkupOrder, ivStack, ivValueDomain } from './scales';
import { IV_CHART_ROOT_CLASSES, IvChartHit, IvChartRoot, ivRange } from './interaction';

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
  /** The resolved series color: the stroke of a line or area, the fill of a bar. */
  color: Signal<string>;
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
  /** Value ticks, from the number axis' `tickCount`. Shared by that axis and the grid. */
  ticks: Signal<number[]>;
  /** The registered series in markup order. */
  series: Signal<readonly IvCartesianSeriesRef[]>;
  /** Bar chart: gap between bars of a category, and on each side of a category (a number or a percent). */
  barGap: Signal<number | string>;
  barCategoryGap: Signal<number | string>;
  /** Adds a series to the stacks and the value domain. Returns the unregister function. */
  register(series: IvCartesianSeriesRef): () => void;
  /** One entry per row; `undefined` is a gap (missing or null value). */
  points(key: string): Signal<(IvCartesianPoint | undefined)[]>;
  /**
   * An axis gives its `dataKey` ('' for a number axis), the space it takes and, for a number axis,
   * its tick count. Returns the unregister function.
   */
  setCategory(key: string, axis: 'x' | 'y', reserve: number, tickCount?: number): () => void;
}

export const IV_CARTESIAN = new InjectionToken<IvCartesianContext>('IV_CARTESIAN');

const MARGIN = 5;
const TICK_COUNT = 5;
const NO_POINTS: (IvCartesianPoint | undefined)[] = [];

interface AxisRef {
  key: string;
  axis: 'x' | 'y';
  reserve: number;
  tickCount?: number;
}

/**
 * The cursor under the tooltip: a band (bar charts) or a line (line and area). The overlay is a
 * transparent rect over the plot, so the plot takes the pointer where nothing is drawn.
 */
const CARTESIAN_TEMPLATE = `
  @let p = plot();
  <svg:rect data-slot="chart-overlay" fill="transparent"
    [attr.x]="p.x" [attr.y]="p.y" [attr.width]="p.width" [attr.height]="p.height" />
  @if (cursorShape(); as c) {
    @if (c.band) {
      <svg:rect data-slot="chart-cursor" class="iv-chart-cursor-rect fill-muted"
        [attr.x]="c.x" [attr.y]="c.y" [attr.width]="c.width" [attr.height]="c.height" />
    } @else {
      <svg:line data-slot="chart-cursor" class="iv-chart-cursor-line stroke-border" fill="none"
        [attr.x1]="c.x" [attr.y1]="c.y" [attr.x2]="c.x + c.width" [attr.y2]="c.y + c.height" />
    }
  }
  <ng-content />
`;

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
export abstract class IvCartesianChart extends IvChartRoot {
  readonly data = input.required<readonly IvChartDatum[]>();
  readonly margin = input<IvChartMargin>({});
  readonly ariaLabel = input('');
  readonly class = input('');

  /** Used in the default label, e.g. "Area". */
  protected abstract readonly name: string;
  protected readonly layout: Signal<IvChartLayout> = signal('horizontal');
  protected readonly offset: Signal<IvStackOffset> = signal('none');
  protected readonly barGap: Signal<number | string> = signal(4);
  protected readonly barCategoryGap: Signal<number | string> = signal('10%');

  private readonly registered = signal<IvCartesianSeriesRef[]>([]);
  private readonly series = computed(() => ivMarkupOrder(this.registered()));
  private readonly axes = signal<AxisRef[]>([]);
  private readonly memo = new Map<string, Signal<(IvCartesianPoint | undefined)[]>>();

  /** Category scale for line and area: points with no padding, so the edges touch. Bar overrides. */
  protected categoryScale(domain: string[], range: [number, number]): ScaleBand<string> | ScalePoint<string> {
    return scalePoint<string>().domain(domain).range(range).padding(0);
  }

  protected readonly plot = computed<IvCartesianPlot>(() => {
    const { width, height } = this.chart.size();
    const m = this.margin();
    const legend = this.chart.reserve();
    let left = m.left ?? MARGIN;
    let bottom = (m.bottom ?? MARGIN) + legend.bottom;
    for (const a of this.axes()) {
      if (a.axis === 'x') bottom += a.reserve;
      else left += a.reserve;
    }
    const top = (m.top ?? MARGIN) + legend.top;
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
    for (const s of this.series()) {
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

  /** The `tickCount` of the number axis on the value side, or 5. */
  private readonly tickCount = computed(() => {
    const side = this.layout() === 'horizontal' ? 'y' : 'x';
    const count = this.axes().find((a) => a.axis === side && a.tickCount !== undefined)?.tickCount;
    return count !== undefined && Number.isFinite(count) && count > 0 ? count : TICK_COUNT;
  });

  private readonly value = computed(() => {
    const extents: [number, number][] = [];
    for (const values of this.stacks().values()) for (const v of values) if (v) extents.push(v);
    const p = this.plot();
    const range = this.layout() === 'horizontal' ? [p.y + p.height, p.y] : [p.x, p.x + p.width];
    return scaleLinear().domain(ivValueDomain(extents, this.tickCount())).range(range);
  });

  private readonly ticks = computed(() => this.value().ticks(this.tickCount()));

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
    ticks: this.ticks,
    series: this.series,
    barGap: computed(() => this.barGap()),
    barCategoryGap: computed(() => this.barCategoryGap()),
    register: (series) => {
      const entry = { ...series };
      this.registered.update((list) => [...list, entry]);
      return () => this.registered.update((list) => list.filter((s) => s !== entry));
    },
    points: (key) => {
      let points = this.memo.get(key);
      if (!points) {
        points = computed(() => this.pixels().get(key) ?? NO_POINTS);
        this.memo.set(key, points);
      }
      return points;
    },
    setCategory: (key, axis, reserve, tickCount) => {
      const entry = { key, axis, reserve, tickCount };
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

  protected readonly classes = computed(() => cn(IV_CHART_ROOT_CLASSES, this.class()));

  // Interaction (IvChartRoot).

  protected override readonly vertical = computed(() => this.layout() === 'vertical');
  private readonly allRows = computed(() => ivRange(this.data().length));

  protected override rows(): number[] {
    return this.allRows();
  }

  override rowCount(): number {
    return this.data().length;
  }

  /** The category under a point in the plot: the band it is in, or the nearest point. */
  protected override hit(x: number, y: number): IvChartHit | null {
    const p = this.plot();
    const category = this.category();
    if (!category || x < p.x || x > p.x + p.width || y < p.y || y > p.y + p.height) return null;
    const { scale } = category;
    const n = this.data().length;
    const start = scale('0') ?? 0;
    const step = scale.step();
    const along = (this.layout() === 'horizontal' ? x : y) - start;
    const raw = scale.bandwidth() > 0 ? Math.floor(along / step) : Math.round(along / step);
    const index = Number.isFinite(raw) ? Math.min(n - 1, Math.max(0, raw)) : 0;
    return { index };
  }

  override anchor(active: IvChartActive): { x: number; y: number } {
    if (active.x !== undefined && active.y !== undefined) return { x: active.x, y: active.y };
    const p = this.plot();
    const category = this.category();
    const at = category ? ivBandCenter(category.scale, active.index) : undefined;
    const middle = this.layout() === 'horizontal' ? p.y + p.height / 2 : p.x + p.width / 2;
    const along = at ?? (this.layout() === 'horizontal' ? p.x : p.y);
    return this.layout() === 'horizontal' ? { x: along, y: middle } : { x: middle, y: along };
  }

  override payload(active: IvChartActive): IvChartPayload[] {
    const row = this.data()[active.index];
    if (!row) return [];
    const items: IvChartPayload[] = [];
    for (const s of this.series()) {
      const value = row[s.key];
      // Recharts' Tooltip `filterNull`: gaps have no row.
      if (value === null || value === undefined) continue;
      items.push({ key: s.key, name: s.key, value, color: s.color(), row });
    }
    return items;
  }

  override activeLabel(active: IvChartActive): unknown {
    const row = this.data()[active.index];
    if (!row) return undefined;
    const key = this.category()?.key;
    return key ? row[key] : active.index;
  }

  override legend(): IvChartLegendItem[] {
    return this.series().map((s) => ({ key: s.key, name: s.key, color: s.color() }));
  }

  /** The tooltip cursor at the active row, in px. */
  protected readonly cursorShape = computed(() => {
    if (!this.chart.cursor()) return null;
    const active = this.chart.active();
    const category = this.category();
    if (!active || !category || !this.data()[active.index]) return null;
    const start = category.scale(String(active.index));
    if (start === undefined) return null;
    const p = this.plot();
    const band = category.scale.bandwidth();
    const horizontal = this.layout() === 'horizontal';
    // A band covers the category; a line runs across the plot at the point.
    return horizontal
      ? { band: band > 0, x: start, y: p.y, width: band, height: p.height }
      : { band: band > 0, x: p.x, y: start, width: p.width, height: band };
  });
}

@Component({
  selector: 'svg[ivLineChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: IV_CARTESIAN, useFactory: () => inject(IvLineChart).context },
    { provide: IvChartRoot, useExisting: IvLineChart },
  ],
  template: CARTESIAN_TEMPLATE,
})
export class IvLineChart extends IvCartesianChart {
  protected readonly name = 'Line';
}

@Component({
  selector: 'svg[ivAreaChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: IV_CARTESIAN, useFactory: () => inject(IvAreaChart).context },
    { provide: IvChartRoot, useExisting: IvAreaChart },
  ],
  template: CARTESIAN_TEMPLATE,
})
export class IvAreaChart extends IvCartesianChart {
  readonly stackOffset = input<IvStackOffset>('none');
  protected readonly name = 'Area';
  protected override readonly offset = this.stackOffset;
}

/** Bars per category, side by side or stacked by `stackId`. `layout="vertical"` draws horizontal bars. */
@Component({
  selector: 'svg[ivBarChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: IV_CARTESIAN, useFactory: () => inject(IvBarChart).context },
    { provide: IvChartRoot, useExisting: IvBarChart },
  ],
  template: CARTESIAN_TEMPLATE,
})
export class IvBarChart extends IvCartesianChart {
  override readonly layout = input<IvChartLayout>('horizontal');
  readonly stackOffset = input<IvStackOffset>('none');
  /** Gap between the bars of one category: px or a percent of the band. */
  override readonly barGap = input<number | string>(4);
  /** Gap on each side of a category: px or a percent of the band. */
  override readonly barCategoryGap = input<number | string>('10%');
  protected readonly name = 'Bar';
  protected override readonly offset = this.stackOffset;

  /** Bands with no padding: `barCategoryGap` makes the space. */
  protected override categoryScale(domain: string[], range: [number, number]): ScaleBand<string> {
    return scaleBand<string>().domain(domain).range(range).padding(0);
  }
}

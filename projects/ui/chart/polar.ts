import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  InjectionToken,
  InputSignal,
  Signal,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { cn } from '@inlaylab/ivorie/core';
import {
  IvChartActive,
  IvChartDatum,
  IvChartLegendItem,
  IvChartMargin,
  IvChartPayload,
  IvSeriesItem,
  IvTickFormatter,
  ivSeriesColor,
  ivSeriesLabel,
} from './types';
import { IvChartLabel, ivFinite, ivLabelContext } from './chart-label';
import {
  ivMarkupOrder,
  ivNiceTicks,
  ivPercent,
  ivPolarPoint,
  ivSideAnchor,
  ivStack,
  ivTemplateAttribute,
} from './scales';
import {
  IV_CHART_ROOT_CLASSES,
  IvChartHit,
  IvChartRoot,
  ivAngleDistance,
  ivInSweep,
  ivPointAngle,
  ivRange,
} from './interaction';

export type IvPolarSeriesKind = 'pie' | 'radar' | 'radialBar';

export interface IvPolarSeriesRef {
  key: string;
  kind: IvPolarSeriesKind;
  /** Radial bars with the same id stack. */
  stackId?: string;
  /** The series' host. Stacks follow markup order. */
  el?: Element;
  /** The drawn items: the tooltip and legend read them. */
  items?: Signal<IvSeriesItem[]>;
  /** The series color (radar, radial bar). A pie's sectors carry their own. */
  color?: Signal<string>;
  /** Pie: the row key of the sector name. */
  nameKey?: string;
}

/** A tick of a polar axis. `coord` is an angle in degrees (angle axis) or a radius in px (radius axis). */
export interface IvPolarTick {
  coord: number;
  value: unknown;
  index: number;
  /** Category ticks: the row. */
  row?: IvChartDatum;
}

export interface IvPolarContext {
  data: Signal<readonly IvChartDatum[]>;
  center: Signal<{ cx: number; cy: number }>;
  /** Half the smaller side of the plot: what `'%'` radii are relative to. */
  maxRadius: Signal<number>;
  /** Resolved from the root's inputs (px or `'%'`). */
  radius: Signal<{ inner: number; outer: number }>;
  /** Degrees, Recharts' convention: 0 is 3 o'clock, positive is counter-clockwise. */
  angles: Signal<{ start: number; end: number }>;
  /** Set by `ivPolarAngleAxis`'s `dataKey`. */
  angleKey: Signal<string | null>;
  /** The registered series in markup order. */
  series: Signal<readonly IvPolarSeriesRef[]>;
  /** Radar: value to radius (px). Radial: value to angle (degrees). */
  value: Signal<ScaleLinear<number, number>>;
  /** Per row, the `[base, top]` value of a radar or radial bar series (stacked by `stackId`); `undefined` is a gap. */
  values(key: string): Signal<([number, number] | undefined)[]>;
  /** Radar: one per row. Radial: value ticks. */
  angleTicks: Signal<IvPolarTick[]>;
  /** Radar: value ticks. Radial: one per row, at the middle of its ring. */
  radiusTicks: Signal<IvPolarTick[]>;
  register(series: IvPolarSeriesRef): () => void;
  setAngleKey(key: string): () => void;
  /** Radar: a fixed value domain from `ivPolarRadiusAxis`. */
  setRadiusDomain(domain: [number, number]): () => void;
}

export const IV_POLAR = new InjectionToken<IvPolarContext>('IV_POLAR');

const MARGIN = 5;
/** Recharts' radius axis: 5 ticks, so 4 rings around the center. */
const RADIUS_TICKS = 4;
const ANGLE_TICKS = 5;
const NO_VALUES: ([number, number] | undefined)[] = [];

/** A radar's tooltip cursor: a line along the active spoke. */
const POLAR_TEMPLATE = `
  @if (cursorLine(); as c) {
    <svg:line data-slot="chart-cursor" class="iv-chart-cursor-line stroke-border" fill="none"
      [attr.x1]="c.x1" [attr.y1]="c.y1" [attr.x2]="c.x2" [attr.y2]="c.y2" />
  }
  <ng-content />
`;

/** Shared root of the polar charts: owns data, center, radii, angles and the value scale. */
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
export abstract class IvPolarChart extends IvChartRoot {
  /** Rows. A pie may bring its own. */
  readonly data = input<readonly IvChartDatum[]>([]);
  readonly innerRadius = input<number | string>(0);
  readonly outerRadius = input<number | string>('80%');
  /** Space around the chart, in px (Recharts' 5 each). Negative values grow the chart. */
  readonly margin = input<IvChartMargin>({});
  readonly ariaLabel = input('');
  readonly class = input('');
  abstract readonly startAngle: InputSignal<number>;
  abstract readonly endAngle: InputSignal<number>;

  /** Used in the default label, e.g. "Pie". */
  protected abstract readonly name: string;

  private readonly registered = signal<IvPolarSeriesRef[]>([]);
  protected readonly series = computed(() => ivMarkupOrder(this.registered()));
  private readonly angleKeys = signal<{ key: string }[]>([]);
  private readonly radiusDomains = signal<[number, number][]>([]);
  private readonly memo = new Map<string, Signal<([number, number] | undefined)[]>>();

  /** The box left for the chart: the size less the margin and the legend's space. */
  private readonly box = computed(() => {
    const { width, height } = this.chart.size();
    const legend = this.chart.reserve();
    const m = this.margin();
    const top = ivFinite(m.top ?? MARGIN) + legend.top;
    const left = ivFinite(m.left ?? MARGIN);
    const right = ivFinite(m.right ?? MARGIN);
    const bottom = ivFinite(m.bottom ?? MARGIN) + legend.bottom;
    return {
      top,
      left,
      width: Math.max(0, width - left - right),
      height: Math.max(0, height - top - bottom),
    };
  });

  protected readonly center = computed(() => {
    const { top, left, width, height } = this.box();
    return { cx: left + width / 2, cy: top + height / 2 };
  });

  protected readonly maxRadius = computed(() => {
    const { width, height } = this.box();
    return Math.min(width, height) / 2;
  });

  protected readonly radius = computed(() => {
    const max = this.maxRadius();
    return {
      inner: ivPercent(this.innerRadius(), max, Infinity),
      outer: ivPercent(this.outerRadius(), max, Infinity),
    };
  });

  protected readonly angles = computed(() => ({
    start: ivFinite(this.startAngle()),
    end: ivFinite(this.endAngle()),
  }));
  protected readonly angleKey = computed(() => this.angleKeys()[0]?.key ?? null);
  protected readonly radiusDomain = computed(() => this.radiusDomains()[0] ?? null);

  /** `[base, top]` per row for radar and radial bar series. Radial bars with a `stackId` stack. */
  protected readonly stacks = computed(() => {
    const data = this.data();
    const groups = new Map<string, string[]>();
    const out = new Map<string, ([number, number] | undefined)[]>();
    for (const s of this.series()) {
      if (s.kind === 'pie') continue;
      if (s.stackId === undefined || s.kind !== 'radialBar') {
        for (const [key, values] of ivStack(data, [s.key], 'none')) out.set(key, values);
      } else {
        groups.set(s.stackId, [...(groups.get(s.stackId) ?? []), s.key]);
      }
    }
    for (const keys of groups.values()) {
      for (const [key, values] of ivStack(data, keys, 'none')) out.set(key, values);
    }
    return out;
  });

  protected readonly extents = computed(() => {
    const extents: [number, number][] = [];
    for (const values of this.stacks().values()) for (const v of values) if (v) extents.push(v);
    return extents;
  });

  protected readonly value = computed(() => this.valueScale());
  protected readonly angleTicks = computed(() => this.angleTicksOf());
  protected readonly radiusTicks = computed(() => this.radiusTicksOf());

  protected abstract valueScale(): ScaleLinear<number, number>;
  protected abstract angleTicksOf(): IvPolarTick[];
  protected abstract radiusTicksOf(): IvPolarTick[];

  /** Shared with the parts through `IV_POLAR`. */
  readonly context: IvPolarContext = {
    data: this.data,
    center: this.center,
    maxRadius: this.maxRadius,
    radius: this.radius,
    angles: this.angles,
    angleKey: this.angleKey,
    series: this.series,
    value: this.value,
    angleTicks: this.angleTicks,
    radiusTicks: this.radiusTicks,
    values: (key) => {
      let values = this.memo.get(key);
      if (!values) {
        values = computed(() => this.stacks().get(key) ?? NO_VALUES);
        this.memo.set(key, values);
      }
      return values;
    },
    register: (series) => {
      const entry = { ...series };
      this.registered.update((list) => [...list, entry]);
      return () => this.registered.update((list) => list.filter((s) => s !== entry));
    },
    setAngleKey: (key) => {
      const entry = { key };
      this.angleKeys.update((list) => [...list, entry]);
      return () => this.angleKeys.update((list) => list.filter((k) => k !== entry));
    },
    setRadiusDomain: (domain) => {
      const entry: [number, number] = [domain[0], domain[1]];
      this.radiusDomains.update((list) => [...list, entry]);
      return () => this.radiusDomains.update((list) => list.filter((d) => d !== entry));
    },
  };

  protected readonly label = computed(() => {
    if (this.ariaLabel()) return this.ariaLabel();
    const config = this.chart.config();
    const names = [...new Set(this.series().map((s) => ivSeriesLabel(config, s.key)))];
    return names.length ? `${this.name} chart: ${names.join(', ')}` : `${this.name} chart`;
  });

  protected readonly viewBox = computed(() => {
    const { width, height } = this.chart.size();
    return `0 0 ${width} ${height}`;
  });

  protected readonly classes = computed(() => cn(IV_CHART_ROOT_CLASSES, this.class()));

  // Interaction (IvChartRoot). Pies are hit by sector; radial bars by ring; radars by spoke.

  protected override readonly vertical = signal(true).asReadonly();
  private readonly pies = computed(() => this.series().filter((s) => s.kind === 'pie'));
  private readonly allRows = computed(() => ivRange(this.data().length));

  /** The pie a key names, or the first one. */
  private pie(key?: string): IvPolarSeriesRef | undefined {
    const pies = this.pies();
    return pies.find((p) => p.key === key) ?? pies[0];
  }

  /** The item of row `index` in a series. */
  private itemOf(ref: IvPolarSeriesRef | undefined, index: number): IvSeriesItem | undefined {
    return ref?.items?.().find((i) => i.index === index);
  }

  protected override navKey(): string | undefined {
    return this.pies()[0]?.key;
  }

  protected override rows(key?: string): number[] {
    if (!this.pies().length) return this.allRows();
    return (this.pie(key)?.items?.() ?? []).map((i) => i.index);
  }

  override rowCount(): number {
    let count = this.data().length;
    for (const pie of this.pies()) {
      for (const item of pie.items?.() ?? []) count = Math.max(count, item.index + 1);
    }
    return count;
  }

  protected override hit(x: number, y: number): IvChartHit | null {
    const { cx, cy } = this.center();
    const r = Math.hypot(x - cx, y - cy);
    const angle = ivPointAngle(cx, cy, x, y);
    const pies = this.pies();
    if (pies.length) {
      // The last pie is drawn on top.
      for (const pie of [...pies].reverse()) {
        for (const item of pie.items?.() ?? []) {
          const inner = item.innerRadius ?? 0;
          const outer = item.outerRadius ?? 0;
          if (
            r >= inner &&
            r <= outer &&
            ivInSweep(angle, item.startAngle ?? 0, item.endAngle ?? 0)
          ) {
            return { index: item.index, key: pie.key };
          }
        }
      }
      return null;
    }
    const n = this.data().length;
    const { inner, outer } = this.radius();
    if (!n || r < inner || r > outer) return null;
    if (this.series().some((s) => s.kind === 'radialBar')) {
      // One ring per row, from the inside out.
      const band = (outer - inner) / n;
      return band > 0 ? { index: Math.min(n - 1, Math.floor((r - inner) / band)) } : null;
    }
    // Radar: the nearest spoke.
    let best: IvChartHit | null = null;
    let distance = Infinity;
    for (const tick of this.angleTicks()) {
      const d = ivAngleDistance(angle, tick.coord);
      if (d < distance) {
        distance = d;
        best = { index: tick.index };
      }
    }
    return best;
  }

  override anchor(active: IvChartActive): { x: number; y: number } {
    if (active.x !== undefined && active.y !== undefined) return { x: active.x, y: active.y };
    const ref = this.pies().length ? this.pie(active.key) : this.series()[0];
    const item = this.itemOf(ref, active.index);
    if (item) return { x: item.x, y: item.y };
    const { cx, cy } = this.center();
    return { x: cx, y: cy };
  }

  override payload(active: IvChartActive): IvChartPayload[] {
    if (this.pies().length) {
      const pie = this.pie(active.key);
      const item = this.itemOf(pie, active.index);
      if (!pie || !item) return [];
      const name = item.payload[pie.nameKey ?? 'name'];
      return [
        {
          key: pie.key,
          name: typeof name === 'string' || typeof name === 'number' ? String(name) : pie.key,
          value: item.value,
          color: item.fill,
          row: item.payload,
        },
      ];
    }
    const row = this.data()[active.index];
    if (!row) return [];
    const items: IvChartPayload[] = [];
    for (const s of this.series()) {
      const value = row[s.key];
      if (value === null || value === undefined) continue;
      items.push({
        key: s.key,
        name: s.key,
        value,
        color: s.color?.() ?? ivSeriesColor(s.key),
        row,
      });
    }
    return items;
  }

  override activeLabel(active: IvChartActive): unknown {
    // A pie has no category axis: Recharts gives no label.
    if (this.pies().length) return undefined;
    const row = this.data()[active.index];
    if (!row) return undefined;
    const key = this.angleKey();
    return key ? row[key] : active.index;
  }

  override legend(): IvChartLegendItem[] {
    if (!this.pies().length) {
      return this.series().map((s) => ({
        key: s.key,
        name: s.key,
        color: s.color?.() ?? ivSeriesColor(s.key),
      }));
    }
    // Pies: one entry per sector name, across rings.
    const seen = new Set<string>();
    const items: IvChartLegendItem[] = [];
    for (const pie of this.pies()) {
      for (const item of pie.items?.() ?? []) {
        const raw = item.payload[pie.nameKey ?? 'name'];
        const named = typeof raw === 'string' || typeof raw === 'number';
        const name = named ? String(raw) : pie.key;
        // Rings share names (stacked pies); a sector with no name is its own entry.
        const id = named ? `name:${name}` : `row:${pie.key}:${item.index}`;
        if (seen.has(id)) continue;
        seen.add(id);
        items.push({ key: pie.key, name, color: item.fill, row: item.payload });
      }
    }
    return items;
  }

  /** Radar only: the tooltip cursor along the active spoke. */
  protected readonly cursorLine = computed(() => {
    const active = this.chart.active();
    if (!this.chart.cursor() || !active || !this.series().some((s) => s.kind === 'radar'))
      return null;
    const tick = this.angleTicks()[active.index];
    if (!tick) return null;
    const { cx, cy } = this.center();
    const { inner, outer } = this.radius();
    const a = ivPolarPoint(cx, cy, inner, tick.coord);
    const b = ivPolarPoint(cx, cy, outer, tick.coord);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });
}

/** Sectors per row: one or more `g[ivPie]` (rings when their radii differ). */
@Component({
  selector: 'svg[ivPieChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: IV_POLAR, useFactory: () => inject(IvPieChart).context },
    { provide: IvChartRoot, useExisting: IvPieChart },
  ],
  template: POLAR_TEMPLATE,
})
export class IvPieChart extends IvPolarChart {
  readonly startAngle = input(0);
  readonly endAngle = input(360);
  protected readonly name = 'Pie';

  protected valueScale() {
    return scaleLinear();
  }
  protected angleTicksOf(): IvPolarTick[] {
    return [];
  }
  protected radiusTicksOf(): IvPolarTick[] {
    return [];
  }
}

/** A spoke per row, clockwise from the top (Recharts: 90° to -270°). Values grow out from the center. */
@Component({
  selector: 'svg[ivRadarChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: IV_POLAR, useFactory: () => inject(IvRadarChart).context },
    { provide: IvChartRoot, useExisting: IvRadarChart },
  ],
  template: POLAR_TEMPLATE,
})
export class IvRadarChart extends IvPolarChart {
  readonly startAngle = input(90);
  readonly endAngle = input(-270);
  protected readonly name = 'Radar';

  /** Recharts' radius axis: 5 round ticks from 0 (or the fixed domain); the last one is the outer ring. */
  private readonly niceTicks = computed(() => {
    const fixed = this.radiusDomain();
    if (fixed && fixed.every(Number.isFinite) && fixed[0] !== fixed[1]) return null;
    let lo = 0;
    let hi = 0;
    for (const [a, b] of this.extents()) {
      lo = Math.min(lo, a, b);
      hi = Math.max(hi, a, b);
    }
    return ivNiceTicks(lo, hi, RADIUS_TICKS + 1);
  });

  protected valueScale() {
    const { inner, outer } = this.radius();
    const ticks = this.niceTicks();
    const domain: [number, number] = ticks
      ? [ticks[0], ticks[ticks.length - 1]]
      : (this.radiusDomain() as [number, number]);
    return scaleLinear().domain(domain).range([inner, outer]);
  }

  protected angleTicksOf(): IvPolarTick[] {
    const data = this.data();
    const { start, end } = this.angles();
    const delta = end - start;
    // A full turn has no repeated end spoke; a partial one ends on `end`.
    const step =
      Math.abs(delta) >= 360
        ? delta / Math.max(1, data.length)
        : delta / Math.max(1, data.length - 1);
    const key = this.angleKey();
    return data.map((row, index) => ({
      coord: start + index * step,
      value: key ? row[key] : index,
      index,
      row,
    }));
  }

  protected radiusTicksOf(): IvPolarTick[] {
    const value = this.value();
    const ticks = this.niceTicks() ?? value.ticks(RADIUS_TICKS);
    return ticks.map((t, index) => ({ coord: value(t), value: t, index }));
  }
}

/** A ring per row, from the inside out. Values sweep from `startAngle` to `endAngle` (0 to the largest value). */
@Component({
  selector: 'svg[ivRadialChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: IV_POLAR, useFactory: () => inject(IvRadialChart).context },
    { provide: IvChartRoot, useExisting: IvRadialChart },
  ],
  template: POLAR_TEMPLATE,
})
export class IvRadialChart extends IvPolarChart {
  readonly startAngle = input(0);
  readonly endAngle = input(360);
  protected readonly name = 'Radial';

  protected valueScale() {
    let lo = 0;
    let hi = 0;
    for (const [a, b] of this.extents()) {
      lo = Math.min(lo, a, b);
      hi = Math.max(hi, a, b);
    }
    const { start, end } = this.angles();
    return scaleLinear()
      .domain(lo === hi ? [0, 1] : [lo, hi])
      .range([start, end]);
  }

  protected angleTicksOf(): IvPolarTick[] {
    const value = this.value();
    return value.ticks(ANGLE_TICKS).map((t, index) => ({ coord: value(t), value: t, index }));
  }

  protected radiusTicksOf(): IvPolarTick[] {
    const data = this.data();
    const { inner, outer } = this.radius();
    const band = data.length ? (outer - inner) / data.length : 0;
    return data.map((row, index) => ({
      coord: inner + (index + 0.5) * band,
      value: index,
      index,
      row,
    }));
  }
}

/** Rings at the radius ticks, then spokes at the angle ticks. `class` goes on each ring and spoke, like Recharts. */
@Component({
  selector: 'g[ivPolarGrid]',
  // `[attr.class]` replaces the user's static class on the group: it belongs to the rings and spokes.
  host: { 'data-slot': 'chart-polar-grid', '[attr.class]': '"iv-chart-polar-grid"' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = ctx.center();
    <svg:g data-slot="chart-polar-grid-concentric">
      @for (ring of rings(); track $index) {
        @if (gridType() === 'circle') {
          <svg:circle
            data-slot="chart-polar-grid-circle"
            fill="none"
            [attr.class]="ringClass() || null"
            [attr.cx]="c.cx"
            [attr.cy]="c.cy"
            [attr.r]="ring.r"
            [attr.stroke]="stroke() ?? null"
          />
        } @else {
          <svg:path
            data-slot="chart-polar-grid-polygon"
            fill="none"
            [attr.class]="ringClass() || null"
            [attr.d]="ring.d"
            [attr.stroke]="stroke() ?? null"
          />
        }
      }
    </svg:g>
    @if (radialLines()) {
      @for (line of spokes(); track $index) {
        <svg:line
          data-slot="chart-polar-grid-line"
          fill="none"
          [attr.class]="ringClass() || null"
          [attr.x1]="line.x1"
          [attr.y1]="line.y1"
          [attr.x2]="line.x2"
          [attr.y2]="line.y2"
          [attr.stroke]="stroke() ?? null"
        />
      }
    }
  `,
})
export class IvPolarGrid {
  readonly gridType = input<'polygon' | 'circle'>('polygon');
  /** Spokes from the center out, one per angle tick. */
  readonly radialLines = input(true, { transform: booleanAttribute });
  /** Ring radii in px. Default: the radius ticks. */
  readonly polarRadius = input<number[]>();
  /** Line color. Default: the theme border. */
  readonly stroke = input<string>();
  readonly class = input('');

  protected readonly ctx = inject(IV_POLAR);

  private readonly angles = computed(() => this.ctx.angleTicks().map((t) => t.coord));

  protected readonly spokes = computed(() => {
    const { cx, cy } = this.ctx.center();
    const { inner, outer } = this.ctx.radius();
    return this.angles().map((angle) => {
      const a = ivPolarPoint(cx, cy, inner, angle);
      const b = ivPolarPoint(cx, cy, outer, angle);
      return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    });
  });

  protected readonly rings = computed(() => {
    const { cx, cy } = this.ctx.center();
    const radii = (this.polarRadius() ?? this.ctx.radiusTicks().map((t) => t.coord)).filter(
      (r) => Number.isFinite(r) && r > 0,
    );
    const angles = this.angles();
    return radii.map((r) => ({
      r,
      d: angles.length
        ? angles
            .map((angle, i) => {
              const p = ivPolarPoint(cx, cy, r, angle);
              return `${i ? 'L' : 'M'}${p.x},${p.y}`;
            })
            .join('') + 'Z'
        : '',
    }));
  });

  protected readonly ringClass = computed(() => cn(this.class()));
}

/** A tick label of the angle axis, given to a custom `tick` template as `$implicit`. */
export interface IvPolarAngleTick {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
  /** The tick's angle, in degrees. */
  angle: number;
  index: number;
  value: unknown;
  /** The formatted label. */
  label: string;
}

export interface IvPolarAngleTickContext {
  $implicit: IvPolarAngleTick;
}

/** Recharts' tick size: labels sit this far outside the outer radius. */
const ANGLE_TICK_SIZE = 8;

/** Labels around the outside: one per row on a radar. `dataKey` names the label column. */
@Component({
  selector: 'g[ivPolarAngleAxis]',
  host: { 'data-slot': 'chart-polar-angle-axis', '[class]': 'classes()' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tickTemplate(); as tpl) {
      @for (tick of ticks(); track tick.index) {
        <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: tick }" />
      }
    } @else if (tick()) {
      @for (tick of ticks(); track tick.index) {
        <svg:g class="iv-chart-tick">
          <svg:text
            [attr.x]="tick.x"
            [attr.y]="tick.y"
            [attr.text-anchor]="tick.textAnchor"
            dy="0.355em"
          >
            {{ tick.label }}
          </svg:text>
        </svg:g>
      }
    }
  `,
})
export class IvPolarAngleAxis {
  readonly dataKey = input('');
  readonly tick = input(true, { transform: ivTemplateAttribute<IvPolarAngleTickContext> });
  readonly tickFormatter = input<IvTickFormatter>();
  readonly class = input('');

  protected readonly ctx = inject(IV_POLAR);

  constructor() {
    effect((onCleanup) => {
      const key = this.dataKey();
      if (key) onCleanup(this.ctx.setAngleKey(key));
    });
  }

  protected readonly tickTemplate = computed(() => {
    const tick = this.tick();
    return tick instanceof TemplateRef ? tick : null;
  });

  protected readonly ticks = computed<IvPolarAngleTick[]>(() => {
    const { cx, cy } = this.ctx.center();
    const r = this.ctx.radius().outer + ANGLE_TICK_SIZE;
    const format = this.tickFormatter();
    const key = this.dataKey();
    return this.ctx.angleTicks().map((t) => {
      const { x, y } = ivPolarPoint(cx, cy, r, t.coord);
      const value = key && t.row ? t.row[key] : t.value;
      return {
        x,
        y,
        textAnchor: ivSideAnchor(x, cx),
        angle: t.coord,
        index: t.index,
        value,
        label: format ? format(value, t.index) : String(value ?? ''),
      };
    });
  });

  protected readonly classes = computed(() => cn('iv-chart-polar-angle-axis', this.class()));
}

/** Value labels along one spoke (`angle`). Hidden by default; also hosts an `ivChartLabel`. */
@Component({
  selector: 'g[ivPolarRadiusAxis]',
  host: { 'data-slot': 'chart-polar-radius-axis', '[class]': 'classes()' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (axisLine()) {
      @let l = line();
      <svg:line
        class="stroke-muted-foreground"
        fill="none"
        [style.stroke]="stroke() ?? null"
        [attr.x1]="l.x1"
        [attr.y1]="l.y1"
        [attr.x2]="l.x2"
        [attr.y2]="l.y2"
      />
    }
    @if (tick()) {
      @for (tick of ticks(); track tick.index) {
        <svg:g class="iv-chart-tick">
          <svg:text
            [attr.x]="tick.x"
            [attr.y]="tick.y"
            [attr.text-anchor]="anchor()"
            [attr.transform]="tick.transform"
            [style.fill]="stroke() ?? null"
          >
            {{ tick.label }}
          </svg:text>
        </svg:g>
      }
    }
    @if (chartLabel(); as l) {
      <ng-container [ngTemplateOutlet]="l.template" [ngTemplateOutletContext]="labelContext()" />
    }
  `,
})
export class IvPolarRadiusAxis {
  /** Radial charts: row key of the ring labels. */
  readonly dataKey = input('');
  readonly tick = input(false, { transform: booleanAttribute });
  readonly axisLine = input(false, { transform: booleanAttribute });
  /** The spoke the axis lies on, in degrees. */
  readonly angle = input(0);
  readonly orientation = input<'left' | 'right' | 'middle'>('right');
  /** Axis line and tick text color (Recharts' `stroke`). Default: muted. */
  readonly stroke = input<string>();
  /** Radar: a fixed value domain. Default: 0 to the largest value, rounded out. */
  readonly domain = input<[number, number]>();
  readonly tickFormatter = input<IvTickFormatter>();
  readonly class = input('');

  protected readonly ctx = inject(IV_POLAR);
  protected readonly chartLabel = contentChild(IvChartLabel);

  constructor() {
    effect((onCleanup) => {
      const domain = this.domain();
      if (domain) onCleanup(this.ctx.setRadiusDomain(domain));
    });
  }

  private readonly at = computed(() => ivFinite(this.angle()));

  protected readonly line = computed(() => {
    const { cx, cy } = this.ctx.center();
    const { inner, outer } = this.ctx.radius();
    const a = ivPolarPoint(cx, cy, inner, this.at());
    const b = ivPolarPoint(cx, cy, outer, this.at());
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });

  protected readonly anchor = computed(() => {
    const o = this.orientation();
    return o === 'left' ? 'end' : o === 'right' ? 'start' : 'middle';
  });

  protected readonly ticks = computed(() => {
    const { cx, cy } = this.ctx.center();
    const angle = this.at();
    const format = this.tickFormatter();
    const key = this.dataKey();
    return this.ctx.radiusTicks().map((t) => {
      const { x, y } = ivPolarPoint(cx, cy, t.coord, angle);
      const value = key && t.row ? t.row[key] : t.value;
      return {
        index: t.index,
        x,
        y,
        // Recharts turns the labels across the spoke.
        transform: `rotate(${90 - angle}, ${x}, ${y})`,
        label: format ? format(value, t.index) : String(value ?? ''),
      };
    });
  });

  protected readonly labelContext = ivLabelContext(this.ctx.center, this.ctx.radius);

  protected readonly classes = computed(() => cn('iv-chart-polar-radius-axis', this.class()));
}

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
import { IV_CHART, IvChartDatum, ivSeriesLabel } from './types';
import { IvTickFormatter } from './axis';
import { IvChartLabel, IvChartLabelContext, IvPolarViewBox } from './chart-label';
import {
  ivMarkupOrder,
  ivPercent,
  ivPolarPoint,
  ivSideAnchor,
  ivStack,
  ivTemplateAttribute,
  ivValueDomain,
} from './scales';

export type IvPolarSeriesKind = 'pie' | 'radar' | 'radialBar';

export interface IvPolarSeriesRef {
  key: string;
  kind: IvPolarSeriesKind;
  /** Radial bars with the same id stack. */
  stackId?: string;
  /** The series' host. Stacks follow markup order. */
  el?: Element;
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
const finite = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);

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
export abstract class IvPolarChart {
  /** Rows. A pie may bring its own. */
  readonly data = input<readonly IvChartDatum[]>([]);
  readonly innerRadius = input<number | string>(0);
  readonly outerRadius = input<number | string>('80%');
  readonly ariaLabel = input('');
  readonly class = input('');
  abstract readonly startAngle: InputSignal<number>;
  abstract readonly endAngle: InputSignal<number>;

  /** Used in the default label, e.g. "Pie". */
  protected abstract readonly name: string;

  protected readonly chart = inject(IV_CHART);
  private readonly registered = signal<IvPolarSeriesRef[]>([]);
  protected readonly series = computed(() => ivMarkupOrder(this.registered()));
  private readonly angleKeys = signal<{ key: string }[]>([]);
  private readonly radiusDomains = signal<[number, number][]>([]);
  private readonly memo = new Map<string, Signal<([number, number] | undefined)[]>>();

  protected readonly center = computed(() => {
    const { width, height } = this.chart.size();
    return {
      cx: MARGIN + Math.max(0, width - 2 * MARGIN) / 2,
      cy: MARGIN + Math.max(0, height - 2 * MARGIN) / 2,
    };
  });

  protected readonly maxRadius = computed(() => {
    const { width, height } = this.chart.size();
    return Math.max(0, Math.min(width - 2 * MARGIN, height - 2 * MARGIN) / 2);
  });

  protected readonly radius = computed(() => {
    const max = this.maxRadius();
    return {
      inner: ivPercent(this.innerRadius(), max, Infinity),
      outer: ivPercent(this.outerRadius(), max, Infinity),
    };
  });

  protected readonly angles = computed(() => ({
    start: finite(this.startAngle()),
    end: finite(this.endAngle()),
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

  protected readonly classes = computed(() => cn('overflow-visible', this.class()));
}

/** Sectors per row: one or more `g[ivPie]` (rings when their radii differ). */
@Component({
  selector: 'svg[ivPieChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IV_POLAR, useFactory: () => inject(IvPieChart).context }],
  template: `<ng-content />`,
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
  providers: [{ provide: IV_POLAR, useFactory: () => inject(IvRadarChart).context }],
  template: `<ng-content />`,
})
export class IvRadarChart extends IvPolarChart {
  readonly startAngle = input(90);
  readonly endAngle = input(-270);
  protected readonly name = 'Radar';

  protected valueScale() {
    const { inner, outer } = this.radius();
    const fixed = this.radiusDomain();
    const domain =
      fixed && fixed.every(Number.isFinite) && fixed[0] !== fixed[1]
        ? fixed
        : ivValueDomain(this.extents(), RADIUS_TICKS);
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
    return value.ticks(RADIUS_TICKS).map((t, index) => ({ coord: value(t), value: t, index }));
  }
}

/** A ring per row, from the inside out. Values sweep from `startAngle` to `endAngle` (0 to the largest value). */
@Component({
  selector: 'svg[ivRadialChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IV_POLAR, useFactory: () => inject(IvRadialChart).context }],
  template: `<ng-content />`,
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

/** Rings at the radius ticks and spokes at the angle ticks. `class` goes on each ring, like Recharts. */
@Component({
  selector: 'g[ivPolarGrid]',
  // `[attr.class]` replaces the user's static class on the group: it belongs to the rings.
  host: { 'data-slot': 'chart-polar-grid', '[attr.class]': '"iv-chart-polar-grid"' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = ctx.center();
    @if (radialLines()) {
      @for (line of spokes(); track $index) {
        <svg:line
          data-slot="chart-polar-grid-line"
          fill="none"
          [attr.x1]="line.x1"
          [attr.y1]="line.y1"
          [attr.x2]="line.x2"
          [attr.y2]="line.y2"
          [attr.stroke]="stroke() ?? null"
        />
      }
    }
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

  private readonly at = computed(() => finite(this.angle()));

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

  protected readonly labelContext = computed<IvChartLabelContext>(() => {
    const { cx, cy } = this.ctx.center();
    const { inner, outer } = this.ctx.radius();
    const box: IvPolarViewBox = { cx, cy, innerRadius: inner, outerRadius: outer };
    return { $implicit: box, ...box };
  });

  protected readonly classes = computed(() => cn('iv-chart-polar-radius-axis', this.class()));
}

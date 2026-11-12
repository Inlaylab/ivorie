import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  InputSignal,
  Signal,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { area, line } from 'd3-shape';
import { cn } from '@inlaylab/ivorie/core';
import { IV_CARTESIAN, IvCartesianPoint } from './cartesian';
import { IvCurve, ivCurve, ivSeriesProvider } from './scales';
import { IV_CHART, IvChartDatum, IvSeriesItem, ivSeriesColor } from './types';

/** A drawn point, given to a custom `dot` template as `$implicit`. */
export interface IvDot {
  cx: number;
  cy: number;
  index: number;
  key: string;
  value: unknown;
  payload: IvChartDatum;
}

export interface IvDotContext {
  $implicit: IvDot;
}

/** Circle props merged over the default dot, like a Recharts `dot={{ … }}` or `activeDot={{ … }}` object. */
export interface IvDotProps {
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/** `dot`: a bare attribute or boolean, a template, or circle props. */
function ivDotAttribute(value: unknown): boolean | TemplateRef<IvDotContext> | IvDotProps {
  if (value instanceof TemplateRef) return value as TemplateRef<IvDotContext>;
  return value !== null && typeof value === 'object' ? (value as IvDotProps) : booleanAttribute(value);
}

/** `activeDot`: a bare attribute or boolean, or circle props. */
function ivActiveDotAttribute(value: unknown): boolean | IvDotProps {
  return value !== null && typeof value === 'object' ? (value as IvDotProps) : booleanAttribute(value);
}

type Point = IvCartesianPoint | undefined;

const BACKGROUND = 'var(--background)';

const DOTS_TEMPLATE = `
  @if (dotTemplate(); as tpl) {
    @for (dot of dots(); track dot.index) {
      <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: dot }" />
    }
  } @else if (dotProps(); as p) {
    @for (dot of dots(); track dot.index) {
      <svg:circle data-slot="chart-dot" [attr.r]="p.r" [attr.fill]="p.fill"
        [attr.cx]="dot.cx" [attr.cy]="dot.cy" [attr.stroke]="p.stroke" [attr.stroke-width]="p.strokeWidth" />
    }
  }
  @if (active(); as a) {
    <svg:circle data-slot="chart-active-dot" [attr.class]="a.stroke === background ? 'iv-chart-dot' : null"
      [attr.r]="a.r" [attr.stroke]="a.stroke" [attr.stroke-width]="a.strokeWidth"
      [attr.cx]="a.cx" [attr.cy]="a.cy" [attr.fill]="a.fill" />
  }
`;

/** Shared series logic: registers with the root, reads its points, draws dots. */
@Directive({
  host: { '[class]': 'classes()' },
})
export abstract class IvCartesianSeries {
  readonly dataKey = input.required<string>();
  readonly curve = input<IvCurve>('linear');
  readonly stroke = input<string>();
  /** The dot at the active row: on, off, or circle props over `r` 4, the series color and a background stroke. */
  readonly activeDot = input<boolean | IvDotProps, unknown>(true, { transform: ivActiveDotAttribute });
  readonly class = input('');
  abstract readonly strokeWidth: InputSignal<number>;
  abstract readonly dot: Signal<boolean | TemplateRef<IvDotContext> | IvDotProps>;

  protected abstract readonly kind: 'line' | 'area';
  protected abstract stackKey(): string | undefined;

  protected readonly ctx = inject(IV_CARTESIAN);
  private readonly chart = inject(IV_CHART);
  private readonly el = inject<ElementRef<Element>>(ElementRef).nativeElement;

  constructor() {
    effect((onCleanup) => {
      const series = { key: this.dataKey(), stackId: this.stackKey(), kind: this.kind, color: this.color, el: this.el };
      onCleanup(this.ctx.register(series));
    });
  }

  protected readonly points = computed(() => this.ctx.points(this.dataKey())());
  protected readonly color = computed(() => this.stroke() ?? ivSeriesColor(this.dataKey()));

  /** The top line of the series; breaks at gaps. */
  protected readonly linePath = computed(() =>
    line<Point>()
      .defined((p) => p !== undefined)
      .x((p) => p!.x)
      .y((p) => p!.y1)
      .curve(ivCurve(this.curve()))(this.points()),
  );

  protected readonly dots = computed<IvDot[]>(() => {
    const data = this.ctx.data();
    const key = this.dataKey();
    const dots: IvDot[] = [];
    this.points().forEach((p, index) => {
      if (p) dots.push({ cx: p.x, cy: p.y1, index, key, value: data[index]?.[key], payload: data[index] });
    });
    return dots;
  });

  /** One item per drawn point, for `ivLabelList`. */
  readonly items = computed<IvSeriesItem[]>(() =>
    this.dots().map((d) => ({
      index: d.index,
      x: d.cx,
      y: d.cy,
      width: 0,
      height: 0,
      value: d.value,
      fill: this.color(),
      payload: d.payload,
    })),
  );

  protected readonly dotTemplate = computed(() => {
    const dot = this.dot();
    return dot instanceof TemplateRef ? dot : null;
  });

  protected readonly background = BACKGROUND;

  /** Recharts' dot: r 3, a background fill, the series stroke; an object overrides each. */
  protected readonly dotProps = computed<Required<IvDotProps> | null>(() => {
    const dot = this.dot();
    if (!dot || dot instanceof TemplateRef) return null;
    const base = { r: 3, fill: BACKGROUND, stroke: this.color(), strokeWidth: this.strokeWidth() };
    return dot === true ? base : { ...base, ...dot };
  });

  protected readonly active = computed(() => {
    const index = this.chart.active()?.index;
    const props = this.activeDot();
    if (!props || index === undefined) return null;
    const p = this.points()[index];
    if (!p) return null;
    const base = { r: 4, fill: this.color(), stroke: BACKGROUND, strokeWidth: 2 };
    return { ...base, ...(props === true ? {} : props), cx: p.x, cy: p.y1 };
  });

  protected readonly classes = computed(() => cn(this.class()));
}

@Component({
  selector: 'g[ivLine]',
  host: { 'data-slot': 'chart-line-series' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ivSeriesProvider(IvLine)],
  template:
    `
    @if (linePath(); as d) {
      <svg:path data-slot="chart-line" class="iv-chart-line motion-safe:animate-chart-draw" fill="none" pathLength="1"
        [attr.d]="d" [attr.stroke]="color()" [attr.stroke-width]="strokeWidth()" />
    }
  ` +
    DOTS_TEMPLATE +
    `<ng-content />`,
})
export class IvLine extends IvCartesianSeries {
  readonly strokeWidth = input(2);
  readonly dot = input<boolean | TemplateRef<IvDotContext> | IvDotProps, unknown>(true, { transform: ivDotAttribute });
  protected readonly kind = 'line';
  protected stackKey(): undefined {
    return undefined;
  }
}

/** An area from its base (0, or the series below in its stack) to its value. Recharts defaults: no dots, 1px stroke. */
@Component({
  selector: 'g[ivArea]',
  host: { 'data-slot': 'chart-area-series' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ivSeriesProvider(IvArea)],
  template:
    `
    @if (areaPath(); as d) {
      <svg:path data-slot="chart-area" class="iv-chart-area motion-safe:animate-chart-fade" stroke="none"
        [attr.d]="d" [attr.fill]="fillColor()" [attr.fill-opacity]="fillOpacity()" />
    }
    @if (linePath(); as d) {
      <svg:path data-slot="chart-area-stroke" class="motion-safe:animate-chart-draw" fill="none" pathLength="1"
        [attr.d]="d" [attr.stroke]="color()" [attr.stroke-width]="strokeWidth()" />
    }
  ` +
    DOTS_TEMPLATE +
    `<ng-content />`,
})
export class IvArea extends IvCartesianSeries {
  readonly strokeWidth = input(1);
  readonly dot = input<boolean | TemplateRef<IvDotContext> | IvDotProps, unknown>(false, { transform: ivDotAttribute });
  readonly fill = input<string>();
  readonly fillOpacity = input(0.6);
  readonly stackId = input<string>();
  protected readonly kind = 'area';
  protected stackKey(): string | undefined {
    return this.stackId();
  }

  protected readonly fillColor = computed(() => this.fill() ?? ivSeriesColor(this.dataKey()));

  protected readonly areaPath = computed(() =>
    area<Point>()
      .defined((p) => p !== undefined)
      .x((p) => p!.x)
      .y0((p) => p!.y0)
      .y1((p) => p!.y1)
      .curve(ivCurve(this.curve()))(this.points()),
  );
}

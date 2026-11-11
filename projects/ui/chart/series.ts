import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  InputSignal,
  Provider,
  TemplateRef,
  Type,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { area, line } from 'd3-shape';
import { cn } from '@inlaylab/ivorie/core';
import { IV_CARTESIAN, IvCartesianPoint } from './cartesian';
import { IvCurve, ivCurve } from './scales';
import { IV_CHART, IV_SERIES, IvChartDatum, IvSeriesContext, IvSeriesItem, ivSeriesColor } from './types';

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

type Point = IvCartesianPoint | undefined;

/** Provides `IV_SERIES` from a line or area, for `ivLabelList`. */
function seriesProvider(type: Type<IvCartesianSeries>): Provider {
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

const DOTS_TEMPLATE = `
  @if (dotTemplate(); as tpl) {
    @for (dot of dots(); track dot.index) {
      <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: dot }" />
    }
  } @else if (dot()) {
    @for (dot of dots(); track dot.index) {
      <svg:circle data-slot="chart-dot" r="3" fill="var(--background)"
        [attr.cx]="dot.cx" [attr.cy]="dot.cy" [attr.stroke]="color()" [attr.stroke-width]="strokeWidth()" />
    }
  }
  @if (active(); as a) {
    <svg:circle data-slot="chart-active-dot" class="iv-chart-dot" r="4" stroke="var(--background)" stroke-width="2"
      [attr.cx]="a.cx" [attr.cy]="a.cy" [attr.fill]="color()" />
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
  readonly activeDot = input(true);
  readonly class = input('');
  abstract readonly strokeWidth: InputSignal<number>;
  abstract readonly dot: InputSignal<boolean | TemplateRef<IvDotContext>>;

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

  protected readonly active = computed(() => {
    const index = this.chart.active()?.index;
    if (!this.activeDot() || index === undefined) return null;
    const p = this.points()[index];
    return p ? { cx: p.x, cy: p.y1 } : null;
  });

  protected readonly classes = computed(() => cn(this.class()));
}

@Component({
  selector: 'g[ivLine]',
  host: { 'data-slot': 'chart-line-series' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [seriesProvider(IvLine)],
  template:
    `
    @if (linePath(); as d) {
      <svg:path data-slot="chart-line" class="iv-chart-line" fill="none"
        [attr.d]="d" [attr.stroke]="color()" [attr.stroke-width]="strokeWidth()" />
    }
  ` +
    DOTS_TEMPLATE +
    `<ng-content />`,
})
export class IvLine extends IvCartesianSeries {
  readonly strokeWidth = input(2);
  readonly dot = input<boolean | TemplateRef<IvDotContext>>(true);
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
  providers: [seriesProvider(IvArea)],
  template:
    `
    @if (areaPath(); as d) {
      <svg:path data-slot="chart-area" class="iv-chart-area" stroke="none"
        [attr.d]="d" [attr.fill]="fillColor()" [attr.fill-opacity]="fillOpacity()" />
    }
    @if (linePath(); as d) {
      <svg:path data-slot="chart-area-stroke" fill="none"
        [attr.d]="d" [attr.stroke]="color()" [attr.stroke-width]="strokeWidth()" />
    }
  ` +
    DOTS_TEMPLATE +
    `<ng-content />`,
})
export class IvArea extends IvCartesianSeries {
  readonly strokeWidth = input(1);
  readonly dot = input<boolean | TemplateRef<IvDotContext>>(false);
  readonly fill = input<string>();
  readonly fillOpacity = input(0.4);
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

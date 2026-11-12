import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { cn } from '@inlaylab/ivorie/core';
import { IV_POLAR } from './polar';
import { IvDot, IvDotContext } from './series';
import { ivPolarPoint, ivSeriesProvider, ivTemplateAttribute } from './scales';
import { IV_CHART, IvSeriesItem, ivSeriesColor } from './types';

/** Entrance: fade and scale in from the shape's own center. Off under reduced motion. */
const ENTER_CLASSES = 'motion-safe:animate-chart-in origin-center [transform-box:fill-box]';

/** A filled polygon through each row's value on its spoke. Rows with no value are left out. */
@Component({
  selector: 'g[ivRadar]',
  host: { 'data-slot': 'chart-radar-series', '[class]': 'classes()' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ivSeriesProvider(IvRadar)],
  template: `
    @if (path(); as d) {
      <svg:path
        data-slot="chart-radar"
        class="iv-chart-radar"
        [attr.d]="d"
        [attr.fill]="color()"
        [attr.fill-opacity]="fillOpacity()"
        [attr.stroke]="stroke() ?? null"
        [attr.stroke-width]="strokeWidth() ?? null"
      />
    }
    @if (dotTemplate(); as tpl) {
      @for (dot of dots(); track dot.index) {
        <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: dot }" />
      }
    } @else if (dot()) {
      @for (dot of dots(); track dot.index) {
        <svg:circle
          data-slot="chart-dot"
          r="4"
          [attr.cx]="dot.cx"
          [attr.cy]="dot.cy"
          [attr.fill]="color()"
        />
      }
    }
    @if (active(); as a) {
      <svg:circle
        data-slot="chart-active-dot"
        class="iv-chart-dot"
        r="4"
        stroke="var(--background)"
        stroke-width="2"
        [attr.cx]="a.cx"
        [attr.cy]="a.cy"
        [attr.fill]="color()"
      />
    }
    <ng-content />
  `,
})
export class IvRadar {
  readonly dataKey = input.required<string>();
  /** Fill color. Default: `var(--color-<dataKey>)`. */
  readonly fill = input<string>();
  readonly fillOpacity = input(1);
  /** Outline color. Default: none. */
  readonly stroke = input<string>();
  readonly strokeWidth = input<number>();
  /** Dots on the vertices, or a template given `IvDot`. */
  readonly dot = input(false, { transform: ivTemplateAttribute<IvDotContext> });
  /** A dot at the vertex of the active row. */
  readonly activeDot = input(true, { transform: booleanAttribute });
  readonly class = input('');

  private readonly ctx = inject(IV_POLAR);
  private readonly chart = inject(IV_CHART);
  private readonly el = inject<ElementRef<Element>>(ElementRef).nativeElement;

  constructor() {
    effect((onCleanup) => {
      onCleanup(
        this.ctx.register({
          key: this.dataKey(),
          kind: 'radar',
          el: this.el,
          items: this.items,
          color: this.color,
        }),
      );
    });
  }

  protected readonly color = computed(() => this.fill() ?? ivSeriesColor(this.dataKey()));

  protected readonly dots = computed<IvDot[]>(() => {
    const { cx, cy } = this.ctx.center();
    const value = this.ctx.value();
    const ticks = this.ctx.angleTicks();
    const data = this.ctx.data();
    const key = this.dataKey();
    const dots: IvDot[] = [];
    this.ctx
      .values(key)()
      .forEach((v, index) => {
        const tick = ticks[index];
        if (!v || !tick) return;
        const p = ivPolarPoint(cx, cy, value(v[1]), tick.coord);
        dots.push({
          cx: p.x,
          cy: p.y,
          index,
          key,
          value: data[index]?.[key],
          payload: data[index],
        });
      });
    return dots;
  });

  protected readonly path = computed(() => {
    const dots = this.dots();
    return dots.length
      ? dots.map((d, i) => `${i ? 'L' : 'M'}${d.cx},${d.cy}`).join('') + 'Z'
      : null;
  });

  /** One item per vertex, for `ivLabelList`. */
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

  protected readonly active = computed(() => {
    const index = this.chart.active()?.index;
    if (!this.activeDot() || index === undefined) return null;
    return this.dots().find((d) => d.index === index) ?? null;
  });

  protected readonly dotTemplate = computed(() => {
    const dot = this.dot();
    return dot instanceof TemplateRef ? dot : null;
  });

  protected readonly classes = computed(() => cn(ENTER_CLASSES, this.class()));
}

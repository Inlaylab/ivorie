import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { cn } from '@inlaylab/ivorie/core';
import { IV_POLAR } from './polar';
import { IvChartLabel, ivArc, ivLabelContext } from './chart-label';
import { ivBarPosition, ivPolarPoint, ivSeriesProvider } from './scales';
import { IV_CHART, IvSeriesItem, ivSeriesColor } from './types';

/** Recharts' radial bar defaults: gap between stacks in a ring, and on each side of a ring. */
const BAR_GAP = 4;
const BAR_CATEGORY_GAP = '10%';

interface RadialBar {
  item: IvSeriesItem;
  d: string;
}

/** Entrance: fade and scale in from the shape's own center. Off under reduced motion. */
const ENTER_CLASSES = 'motion-safe:animate-chart-in origin-center [transform-box:fill-box]';

/**
 * An arc per row, on the row's ring. Bars with the same `stackId` share a ring and stack;
 * others sit side by side in markup order. Rows with no value draw no arc.
 */
@Component({
  selector: 'g[ivRadialBar]',
  host: { 'data-slot': 'chart-radial-bar-series', '[class]': 'classes()' },
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ivSeriesProvider(IvRadialBar)],
  template: `
    @if (background()) {
      @for (d of tracks(); track $index) {
        <svg:path
          data-slot="chart-radial-bar-background"
          class="iv-chart-radial-background"
          fill="var(--muted)"
          [attr.d]="d"
        />
      }
    }
    @for (bar of bars(); track bar.item.index) {
      <svg:path
        data-slot="chart-radial-bar"
        class="iv-chart-sector"
        [attr.d]="bar.d"
        [attr.fill]="bar.item.fill"
        [attr.data-active]="bar.item.index === active() ? '' : null"
      />
    }
    <ng-content />
    @if (chartLabel(); as l) {
      <ng-container [ngTemplateOutlet]="l.template" [ngTemplateOutletContext]="labelContext()" />
    }
  `,
})
export class IvRadialBar {
  readonly dataKey = input.required<string>();
  /** A muted track behind each bar, over the whole sweep. */
  readonly background = input(false, { transform: booleanAttribute });
  /** Rounds the bar ends (Recharts' default: square). */
  readonly cornerRadius = input(0);
  readonly stackId = input<string>();
  /** Bar color. Default: `var(--color-<dataKey>)`. A row's own `fill` wins. */
  readonly fill = input<string>();
  readonly class = input('');

  private readonly ctx = inject(IV_POLAR);
  private readonly chart = inject(IV_CHART);
  private readonly el = inject<ElementRef<Element>>(ElementRef).nativeElement;
  protected readonly chartLabel = contentChild(IvChartLabel);

  constructor() {
    effect((onCleanup) => {
      onCleanup(
        this.ctx.register({
          key: this.dataKey(),
          kind: 'radialBar',
          stackId: this.stackId(),
          el: this.el,
          items: this.items,
          color: this.color,
        }),
      );
    });
  }

  protected readonly color = computed(() => this.fill() ?? ivSeriesColor(this.dataKey()));

  /** Each row's ring for this bar: one slot per stack (or per unstacked bar), in markup order. */
  private readonly rings = computed(() => {
    const slotOf = (key: string, stackId?: string) =>
      stackId === undefined ? `key:${key}` : `stack:${stackId}`;
    const slots: string[] = [];
    for (const s of this.ctx.series()) {
      const id = slotOf(s.key, s.stackId);
      if (s.kind === 'radialBar' && !slots.includes(id)) slots.push(id);
    }
    const slot = slots.indexOf(slotOf(this.dataKey(), this.stackId()));
    const count = this.ctx.data().length;
    if (slot < 0 || !count) return [];
    const { inner, outer } = this.ctx.radius();
    const band = Math.max(0, (outer - inner) / count);
    const { offset, size } = ivBarPosition(band, slots.length, slot, BAR_GAP, BAR_CATEGORY_GAP);
    return Array.from({ length: count }, (_, i) => {
      const r0 = inner + i * band + offset;
      return { inner: r0, outer: r0 + size };
    });
  });

  protected readonly tracks = computed(() => {
    const { cx, cy } = this.ctx.center();
    const { start, end } = this.ctx.angles();
    const corner = this.cornerRadius();
    return this.rings().map((r, index) =>
      ivArc(
        {
          cx,
          cy,
          innerRadius: r.inner,
          outerRadius: r.outer,
          startAngle: start,
          endAngle: end,
          fill: '',
          index,
        },
        corner,
      ),
    );
  });

  protected readonly bars = computed<RadialBar[]>(() => {
    const rings = this.rings();
    const { cx, cy } = this.ctx.center();
    const value = this.ctx.value();
    const data = this.ctx.data();
    const key = this.dataKey();
    const color = this.color();
    const corner = this.cornerRadius();
    const bars: RadialBar[] = [];
    this.ctx
      .values(key)()
      .forEach((v, index) => {
        const ring = rings[index];
        if (!v || !ring) return;
        const row = data[index];
        const fill = typeof row['fill'] === 'string' ? row['fill'] : color;
        const startAngle = value(v[0]);
        const endAngle = value(v[1]);
        const midAngle = (startAngle + endAngle) / 2;
        const centroid = ivPolarPoint(cx, cy, (ring.inner + ring.outer) / 2, midAngle);
        const shape = {
          cx,
          cy,
          innerRadius: ring.inner,
          outerRadius: ring.outer,
          startAngle,
          endAngle,
          fill,
          index,
        };
        bars.push({
          d: ivArc(shape, corner),
          item: {
            index,
            x: centroid.x,
            y: centroid.y,
            width: 0,
            height: 0,
            value: row[key],
            fill,
            payload: row,
            cx,
            cy,
            innerRadius: ring.inner,
            outerRadius: ring.outer,
            startAngle,
            endAngle,
            midAngle,
          },
        });
      });
    return bars;
  });

  /** One item per drawn bar, for `ivLabelList`. */
  readonly items = computed<IvSeriesItem[]>(() => this.bars().map((b) => b.item));

  /** The hovered ring's bar (`data-active`), unless the active row names another series. */
  protected readonly active = computed(() => {
    const active = this.chart.active();
    return active && (active.key === undefined || active.key === this.dataKey())
      ? active.index
      : undefined;
  });

  protected readonly labelContext = ivLabelContext(this.ctx.center, this.ctx.radius);

  protected readonly classes = computed(() => cn(ENTER_CLASSES, this.class()));
}

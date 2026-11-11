import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input } from '@angular/core';
import { cn } from '@inlaylab/ivorie/core';
import { IV_CARTESIAN } from './cartesian';
import { ivBarPosition, ivSeriesProvider } from './scales';
import { IV_CHART, IvSeriesItem, ivSeriesColor } from './types';

/** One radius for every corner, or `[topLeft, topRight, bottomRight, bottomLeft]`. */
export type IvBarRadius = number | [number, number, number, number];

/** A drawn bar: its item and its path. */
interface Bar {
  item: IvSeriesItem;
  d: string;
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

/**
 * A rect path with corner arcs (Recharts' Rectangle). `width` and `height` may be negative:
 * corners are named as if they were positive, so the "top" corners stay at the bar's tip.
 */
export function ivBarPath(x: number, y: number, width: number, height: number, radius: IvBarRadius): string {
  const max = Math.min(Math.abs(width) / 2, Math.abs(height) / 2);
  const r = (typeof radius === 'number' ? [radius, radius, radius, radius] : radius).map((v) =>
    Math.min(Math.max(finite(v), 0), max),
  );
  if (max <= 0 || r.every((v) => v === 0)) return `M${x},${y}h${width}v${height}h${-width}Z`;
  const sx = width >= 0 ? 1 : -1;
  const sy = height >= 0 ? 1 : -1;
  const sweep = sx === sy ? 1 : 0;
  const arc = (v: number, ex: number, ey: number) => (v > 0 ? `A${v},${v},0,0,${sweep},${ex},${ey}` : '');
  const [tl, tr, br, bl] = r;
  return [
    `M${x},${y + sy * tl}`,
    arc(tl, x + sx * tl, y),
    `L${x + width - sx * tr},${y}`,
    arc(tr, x + width, y + sy * tr),
    `L${x + width},${y + height - sy * br}`,
    arc(br, x + width - sx * br, y + height),
    `L${x + sx * bl},${y + height}`,
    arc(bl, x, y + height - sy * bl),
    'Z',
  ].join('');
}

/** A bar per row. Bars with the same `stackId` stack; others sit side by side in markup order. */
@Component({
  selector: 'g[ivBar]',
  host: { 'data-slot': 'chart-bar-series', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ivSeriesProvider(IvBar)],
  template: `
    @for (bar of bars(); track bar.item.index) {
      <svg:path data-slot="chart-bar" class="iv-chart-bar"
        [attr.d]="bar.d" [attr.fill]="bar.item.fill"
        [attr.data-active]="bar.item.index === active() ? '' : null" />
    }
    <ng-content />
  `,
})
export class IvBar {
  readonly dataKey = input.required<string>();
  readonly stackId = input<string>();
  /** Corner radius: one number, or `[topLeft, topRight, bottomRight, bottomLeft]`. */
  readonly radius = input<IvBarRadius>(0);
  readonly fill = input<string>();
  /** The highlighted bar. Without it, the bar under the cursor. */
  readonly activeIndex = input<number>();
  readonly class = input('');

  private readonly ctx = inject(IV_CARTESIAN);
  private readonly chart = inject(IV_CHART);
  private readonly el = inject<ElementRef<Element>>(ElementRef).nativeElement;

  protected readonly color = computed(() => this.fill() ?? ivSeriesColor(this.dataKey()));

  constructor() {
    effect((onCleanup) => {
      const series = { key: this.dataKey(), stackId: this.stackId(), kind: 'bar' as const, color: this.color, el: this.el };
      onCleanup(this.ctx.register(series));
    });
  }

  /** This bar's place in each band: one slot per stack (or per unstacked bar), in markup order. */
  private readonly slot = computed(() => {
    const category = this.ctx.category();
    if (!category) return null;
    const slotOf = (key: string, stackId?: string) => (stackId === undefined ? `key:${key}` : `stack:${stackId}`);
    const slots: string[] = [];
    for (const s of this.ctx.series()) {
      const id = slotOf(s.key, s.stackId);
      if (s.kind === 'bar' && !slots.includes(id)) slots.push(id);
    }
    const index = slots.indexOf(slotOf(this.dataKey(), this.stackId()));
    if (index < 0) return null;
    const band = category.scale.bandwidth();
    return ivBarPosition(band, slots.length, index, this.ctx.barGap(), this.ctx.barCategoryGap());
  });

  protected readonly bars = computed<Bar[]>(() => {
    const slot = this.slot();
    const category = this.ctx.category();
    if (!slot || !category) return [];
    const data = this.ctx.data();
    const key = this.dataKey();
    const horizontal = this.ctx.layout() === 'horizontal';
    const radius = this.radius();
    const color = this.color();
    const bars: Bar[] = [];
    this.ctx.points(key)().forEach((p, index) => {
      const start = category.scale(String(index));
      if (!p || start === undefined) return;
      const along = start + slot.offset;
      // Recharts' signed rect: from the value's end back to its base (horizontal),
      // or from the base out to the value (vertical).
      const [x, y, width, height] = horizontal
        ? [along, p.y1, slot.size, p.y0 - p.y1]
        : [p.y0, along, p.y1 - p.y0, slot.size];
      const row = data[index];
      const fill = typeof row['fill'] === 'string' ? row['fill'] : color;
      bars.push({
        d: ivBarPath(x, y, width, height, radius),
        item: {
          index,
          x: Math.min(x, x + width),
          y: Math.min(y, y + height),
          width: Math.abs(width),
          height: Math.abs(height),
          value: row[key],
          fill,
          payload: row,
        },
      });
    });
    return bars;
  });

  /** One item per drawn bar, for `ivLabelList`. */
  readonly items = computed<IvSeriesItem[]>(() => this.bars().map((b) => b.item));

  protected readonly active = computed(() => this.activeIndex() ?? this.chart.active()?.index);

  protected readonly classes = computed(() => cn(this.class()));
}

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { cn } from '@inlaylab/ivorie/core';
import { IV_CARTESIAN } from './cartesian';
import { ivNumber } from './scales';
import { IV_SERIES, IvSeriesItem } from './types';

/** `outside` is for pie sectors; on bars and points it acts like `top`. */
export type IvLabelPosition = 'top' | 'inside' | 'insideLeft' | 'right' | 'outside';

/** Recharts' label formatter. `any`, so `(value: number) => …` binds without a cast. */
export type IvLabelFormatter = (value: any) => string;

interface Label {
  index: number;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  dy: string | null;
  text: string;
}

/** Recharts' vertical anchors as SVG `dy`: one line of text. */
const DY = { start: '0.71em', middle: '0.355em', end: null } as const;

/**
 * Places a label like Recharts' cartesian `Label`. The rect is signed: a negative bar's
 * "top" is its tip, so its `top` label sits under it.
 */
function place(item: IvSeriesItem, position: IvLabelPosition, offset: number, flipX: boolean, flipY: boolean) {
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  const x = flipX ? item.x + item.width : item.x;
  const y = flipY ? item.y + item.height : item.y;
  const w = sx * item.width;
  const h = sy * item.height;
  const start = sx > 0 ? 'start' : 'end';
  switch (position) {
    case 'inside':
      return { x: x + w / 2, y: y + h / 2, anchor: 'middle', dy: DY.middle } as const;
    case 'insideLeft':
      return { x: x + sx * offset, y: y + h / 2, anchor: start, dy: DY.middle } as const;
    case 'right':
      return { x: x + w + sx * offset, y: y + h / 2, anchor: start, dy: DY.middle } as const;
    default:
      return { x: x + w / 2, y: y - sy * offset, anchor: 'middle', dy: sy > 0 ? DY.end : DY.start } as const;
  }
}

/** Text labels for each item of the series it sits in (`g[ivBar]`, `g[ivLine]`, `g[ivArea]`). */
@Component({
  selector: 'g[ivLabelList]',
  host: { 'data-slot': 'chart-label-list', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (label of labels(); track label.index) {
      <svg:text [attr.x]="label.x" [attr.y]="label.y" [attr.text-anchor]="label.anchor" [attr.dy]="label.dy">{{
        label.text
      }}</svg:text>
    }
  `,
})
export class IvLabelList {
  /** Row key of the label text. Default: the series' key. */
  readonly dataKey = input<string>();
  readonly position = input<IvLabelPosition>('top');
  /** Distance from the item, in px. */
  readonly offset = input(12);
  readonly formatter = input<IvLabelFormatter>();
  readonly class = input('');

  private readonly series = inject(IV_SERIES);
  private readonly cartesian = inject(IV_CARTESIAN, { optional: true });

  protected readonly labels = computed<Label[]>(() => {
    const key = this.dataKey() ?? this.series.key;
    const format = this.formatter();
    const position = this.position();
    const offset = ivNumber(this.offset()) ?? 0;
    const vertical = this.cartesian?.layout() === 'vertical';
    const labels: Label[] = [];
    for (const item of this.series.items()) {
      const value = item.payload[key];
      if (value === null || value === undefined) continue;
      // Only a bar (an item with a size) has a direction to flip.
      const negative = (ivNumber(item.value) ?? 0) < 0 && (item.width > 0 || item.height > 0);
      const at = place(item, position, offset, negative && vertical, negative && !vertical);
      labels.push({ index: item.index, ...at, text: format ? format(value) : String(value) });
    }
    return labels;
  });

  protected readonly classes = computed(() => cn('iv-chart-label-list fill-muted-foreground', this.class()));
}

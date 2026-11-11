import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  InputSignal,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { cn } from '@inlaylab/ivorie/core';
import { IV_CARTESIAN } from './cartesian';
import { ivBandCenter } from './scales';

export type IvAxisType = 'category' | 'number';

/** Recharts' formatter. `any`, so `(value: string) => …` binds without a cast. */
export type IvTickFormatter = (value: any, index: number) => string;

const TICK_SIZE = 6;
/**
 * Estimated label size for `minTickGap`, at the container's 12px text: about 0.55em per
 * character across, one line (12px) down. An estimate, so server and client agree without measuring.
 */
const CHAR_WIDTH = 6.6;
const LINE_HEIGHT = 12;

interface Tick {
  pos: number;
  label: string;
}

/**
 * Recharts' `preserveEnd`: keep the last tick, then walk back and keep a tick only when
 * `gap` px fit between its label and the last kept one.
 */
function spaced(ticks: Tick[], gap: number, size: (tick: Tick) => number): Tick[] {
  const kept: Tick[] = [];
  let end = Infinity;
  for (let i = ticks.length - 1; i >= 0; i--) {
    const tick = ticks[i];
    const half = size(tick) / 2;
    if (tick.pos + half <= end) {
      kept.push(tick);
      end = tick.pos - half - gap;
    }
  }
  return kept.reverse();
}

const AXIS_TEMPLATE = `
  @if (!hide()) {
    @let g = geometry();
    @if (axisLine()) {
      <svg:line class="stroke-muted-foreground" fill="none"
        [attr.x1]="g.line[0]" [attr.y1]="g.line[1]" [attr.x2]="g.line[2]" [attr.y2]="g.line[3]" />
    }
    @for (tick of ticks(); track $index) {
      <svg:g class="iv-chart-tick">
        @if (tickLine()) {
          <svg:line class="stroke-muted-foreground" fill="none"
            [attr.x1]="g.horizontal ? tick.pos : g.at"
            [attr.y1]="g.horizontal ? g.at : tick.pos"
            [attr.x2]="g.horizontal ? tick.pos : g.at + g.sign * tickSize"
            [attr.y2]="g.horizontal ? g.at + g.sign * tickSize : tick.pos" />
        }
        <svg:text
          [attr.x]="g.horizontal ? tick.pos : g.text"
          [attr.y]="g.horizontal ? g.text : tick.pos"
          [attr.text-anchor]="g.horizontal ? 'middle' : 'end'"
          [attr.dy]="g.horizontal ? '0.71em' : '0.355em'">{{ tick.label }}</svg:text>
      </svg:g>
    }
  }
`;

/** Shared axis logic. X sits under the plot, Y on its left. */
@Directive({
  host: { '[class]': 'classes()' },
})
export abstract class IvCartesianAxis {
  readonly dataKey = input('');
  readonly hide = input(false);
  readonly tickLine = input(true);
  readonly axisLine = input(true);
  readonly tickMargin = input(8);
  readonly tickFormatter = input<IvTickFormatter>();
  /** Category axis: hide a tick when its label would be closer than this many px to the next shown one. */
  readonly minTickGap = input(5);
  /** Number axis: about how many value ticks to draw (a d3 `ticks` hint). */
  readonly tickCount = input(5);
  readonly class = input('');
  abstract readonly type: InputSignal<IvAxisType>;

  protected abstract readonly side: 'x' | 'y';
  /** Space the axis takes across the plot. */
  protected abstract reserve(): number;

  protected readonly tickSize = TICK_SIZE;
  protected readonly ctx = inject(IV_CARTESIAN);

  constructor() {
    effect((onCleanup) => {
      const category = this.type() === 'category';
      const reserve = this.hide() || !Number.isFinite(this.reserve()) ? 0 : this.reserve();
      const tickCount = category ? undefined : this.tickCount();
      onCleanup(this.ctx.setCategory(category ? this.dataKey() : '', this.side, reserve, tickCount));
    });
  }

  protected readonly ticks = computed<Tick[]>(() => {
    const format = this.tickFormatter();
    const categorySide = this.ctx.layout() === 'horizontal' ? 'x' : 'y';
    if (this.type() === 'category') {
      const category = this.ctx.category();
      if (!category || this.side !== categorySide) return [];
      const key = this.dataKey();
      const ticks: Tick[] = [];
      this.ctx.data().forEach((row, i) => {
        const pos = ivBandCenter(category.scale, i);
        const value = key ? row[key] : i;
        if (pos !== undefined) ticks.push({ pos, label: format ? format(value, i) : String(value ?? '') });
      });
      const gap = this.minTickGap();
      const size = (tick: Tick) => (this.side === 'x' ? tick.label.length * CHAR_WIDTH : LINE_HEIGHT);
      return spaced(ticks, Number.isFinite(gap) ? gap : 0, size);
    }
    if (this.side === categorySide) return [];
    const value = this.ctx.value();
    return this.ctx.ticks().map((t, i) => ({ pos: value(t), label: format ? format(t, i) : String(t) }));
  });

  protected readonly geometry = computed(() => {
    const p = this.ctx.plot();
    const horizontal = this.side === 'x';
    // X: the axis line is the plot's bottom edge, ticks go down. Y: its left edge, ticks go left.
    const at = horizontal ? p.y + p.height : p.x;
    const sign = horizontal ? 1 : -1;
    const line = horizontal ? [p.x, at, p.x + p.width, at] : [at, p.y, at, p.y + p.height];
    return { horizontal, at, sign, line, text: at + sign * (TICK_SIZE + this.tickMargin()) };
  });

  protected readonly classes = computed(() => cn('iv-chart-axis', this.class()));
}

@Component({
  selector: 'g[ivXAxis]',
  host: { 'data-slot': 'chart-x-axis' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: AXIS_TEMPLATE,
})
export class IvXAxis extends IvCartesianAxis {
  readonly type = input<IvAxisType>('category');
  /** Space for the tick labels under the plot. */
  readonly height = input(30);
  protected readonly side = 'x';
  protected reserve(): number {
    return this.height();
  }
}

@Component({
  selector: 'g[ivYAxis]',
  host: { 'data-slot': 'chart-y-axis' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: AXIS_TEMPLATE,
})
export class IvYAxis extends IvCartesianAxis {
  readonly type = input<IvAxisType>('number');
  /** Space for the tick labels. */
  readonly width = input(60);
  protected readonly side = 'y';
  protected reserve(): number {
    return this.width();
  }
}

/** Grid lines: horizontal at value ticks, vertical at categories (swapped in a vertical layout). */
@Component({
  selector: 'g[ivCartesianGrid]',
  host: { 'data-slot': 'chart-grid', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = ctx.plot();
    @if (horizontal()) {
      @for (y of lines().horizontal; track $index) {
        <svg:line data-direction="horizontal" fill="none" [attr.x1]="p.x" [attr.x2]="p.x + p.width" [attr.y1]="y" [attr.y2]="y" />
      }
    }
    @if (vertical()) {
      @for (x of lines().vertical; track $index) {
        <svg:line data-direction="vertical" fill="none" [attr.x1]="x" [attr.x2]="x" [attr.y1]="p.y" [attr.y2]="p.y + p.height" />
      }
    }
  `,
})
export class IvCartesianGrid {
  readonly vertical = input(true);
  readonly horizontal = input(true);
  readonly class = input('');

  protected readonly ctx = inject(IV_CARTESIAN);

  protected readonly lines = computed(() => {
    const value = this.ctx.value();
    const values = this.ctx.ticks().map((t) => value(t));
    const category = this.ctx.category();
    const categories: number[] = [];
    if (category) {
      for (let i = 0; i < this.ctx.data().length; i++) {
        const pos = ivBandCenter(category.scale, i);
        if (pos !== undefined) categories.push(pos);
      }
    }
    return this.ctx.layout() === 'horizontal'
      ? { horizontal: values, vertical: categories }
      : { horizontal: categories, vertical: values };
  });

  protected readonly classes = computed(() => cn('iv-chart-grid', this.class()));
}

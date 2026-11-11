import { Directive, ElementRef, Signal, inject } from '@angular/core';
import { IV_CHART, IvChartActive, IvChartLegendItem, IvChartPayload, IvChartSource } from './types';

/** The root is a tab stop: a ring for keyboard focus (an outline, since svg has no border). */
export const IV_CHART_ROOT_CLASSES =
  'overflow-visible focus-visible:outline-[3px] focus-visible:outline-offset-0 focus-visible:outline-ring/50';

/** What the pointer is over: a row, and for a pie ring its series. */
export interface IvChartHit {
  index: number;
  key?: string;
}

/**
 * Shared root behavior: pointer, touch and keyboard set `IV_CHART.active`. The root is one
 * tab stop. Arrows move the active row and wrap (Right/Left, or Down/Up when `vertical`),
 * Home and End jump to the ends, Escape clears it. Listeners are on the host only.
 */
@Directive({
  host: {
    tabindex: '0',
    '(pointermove)': 'onPointer($event)',
    '(pointerdown)': 'onPointer($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(keydown)': 'onKeydown($event)',
    '(focus)': 'onFocus(true)',
    '(blur)': 'onFocus(false)',
  },
})
export abstract class IvChartRoot implements IvChartSource {
  protected readonly chart = inject(IV_CHART);
  private readonly host = inject<ElementRef<Element>>(ElementRef).nativeElement;

  /** Down/Up walk the rows instead of Right/Left. */
  protected abstract readonly vertical: Signal<boolean>;
  /** The rows the keyboard walks, in order. A pie walks the ring `key` names (or its first ring). */
  protected abstract rows(key?: string): number[];
  /** The series the keyboard follows when nothing names one. */
  protected navKey(_active: IvChartActive | null): string | undefined {
    return undefined;
  }
  /** What is under a point in chart px, or null. */
  protected abstract hit(x: number, y: number): IvChartHit | null;

  abstract rowCount(): number;
  abstract payload(active: IvChartActive): IvChartPayload[];
  abstract activeLabel(active: IvChartActive): unknown;
  abstract anchor(active: IvChartActive): { x: number; y: number };
  abstract legend(): IvChartLegendItem[];

  protected onPointer(event: PointerEvent): void {
    const rect = this.host.getBoundingClientRect();
    const { width, height } = this.chart.size();
    // The viewBox is the chart size; CSS may draw the svg at another size.
    const sx = rect.width > 0 ? width / rect.width : 1;
    const sy = rect.height > 0 ? height / rect.height : 1;
    const x = (event.clientX - rect.left) * sx;
    const y = (event.clientY - rect.top) * sy;
    const hit = Number.isFinite(x) && Number.isFinite(y) ? this.hit(x, y) : null;
    this.chart.active.set(hit ? { ...hit, x, y } : null);
  }

  protected onPointerLeave(event: PointerEvent): void {
    // A finger lifting also "leaves": keep the tooltip until focus moves away.
    if (event.pointerType !== 'touch') this.chart.active.set(null);
  }

  protected onFocus(focused: boolean): void {
    this.chart.focused.set(focused);
    if (!focused) this.chart.active.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const active = this.chart.active();
    if (event.key === 'Escape') {
      if (!active) return;
      this.chart.active.set(null);
      event.preventDefault();
      return;
    }
    const [next, prev] = this.vertical() ? ['ArrowDown', 'ArrowUp'] : ['ArrowRight', 'ArrowLeft'];
    const key = active?.key ?? this.navKey(active);
    const rows = this.rows(key);
    const n = rows.length;
    if (!n) return;
    const at = active ? rows.indexOf(active.index) : -1;
    let i: number;
    switch (event.key) {
      case next:
        i = at < 0 ? 0 : (at + 1) % n;
        break;
      case prev:
        i = at < 0 ? n - 1 : (at - 1 + n) % n;
        break;
      case 'Home':
        i = 0;
        break;
      case 'End':
        i = n - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.chart.active.set(key === undefined ? { index: rows[i] } : { index: rows[i], key });
  }
}

/** Index range `[0, n)`. */
export function ivRange(n: number): number[] {
  return Array.from({ length: Math.max(0, n) }, (_, i) => i);
}

/** Recharts degrees of a point around a center: 0 is 3 o'clock, counter-clockwise, in `(-180, 180]`. */
export function ivPointAngle(cx: number, cy: number, x: number, y: number): number {
  return (Math.atan2(cy - y, x - cx) * 180) / Math.PI;
}

/** Whether `angle` lies in the sweep from `start` to `end` (either direction), modulo 360. */
export function ivInSweep(angle: number, start: number, end: number): boolean {
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  if (hi - lo >= 360) return true;
  const a = lo + ((((angle - lo) % 360) + 360) % 360);
  return a <= hi;
}

/** The smallest distance between two angles, in degrees. */
export function ivAngleDistance(a: number, b: number): number {
  return Math.abs(((((a - b) % 360) + 540) % 360) - 180);
}

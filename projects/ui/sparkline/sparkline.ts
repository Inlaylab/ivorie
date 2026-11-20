import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

/**
 * A tiny trend line for a stat or a table cell: no axes, no tooltip. Draws in `currentColor`.
 * Hidden from screen readers unless it has a `label`; say the trend in text next to it.
 */
@Component({
  selector: 'svg[ivSparkline]',
  host: {
    'data-slot': 'sparkline',
    viewBox: '0 0 100 32',
    preserveAspectRatio: 'none',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (type() === 'area' && points()) {
      <svg:path [attr.d]="area()" data-slot="sparkline-area" class="cn-sparkline-area fill-current opacity-15" />
    }
    @if (points()) {
      <svg:path [attr.d]="line()" data-slot="sparkline-line" class="cn-sparkline-line fill-none stroke-current" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    }
  `,
})
export class IvSparkline {
  readonly data = input<number[]>([])
  readonly type = input<'line' | 'area'>('line')
  /** Names the chart when it carries meaning on its own. */
  readonly label = input('')
  readonly class = input('')

  /** Points in the 100 × 32 box, with a pixel of room so the stroke is not cut at the top and bottom. */
  protected readonly points = computed(() => {
    const d = this.data().filter((v) => Number.isFinite(v))
    if (d.length < 2) return null
    const [lo, hi] = [Math.min(...d), Math.max(...d)]
    const span = hi - lo || 1
    return d.map((v, i) => [(i / (d.length - 1)) * 100, 30 - ((v - lo) / span) * 28] as const)
  })
  protected readonly line = computed(() => this.points()!.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' '))
  protected readonly area = computed(() => `${this.line()} L100 32 L0 32 Z`)

  protected readonly classes = computed(() => cn('cn-sparkline h-8 w-24 shrink-0 overflow-visible', this.class()))
}

import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

/** Optional numeric input: a static `low="20"` becomes 20; unset stays undefined (numberAttribute alone gives NaN). */
const optionalNumber = (v: unknown): number | undefined => (v == null || v === '' ? undefined : numberAttribute(v))

export type IvGaugeShape = 'radial' | 'capsule'

/**
 * One value in a range, drawn as segments: a 270° ring of short arcs (`radial`) or a row of capsules
 * (`capsule`). The value sits in the middle of the ring, or after the capsules.
 */
@Component({
  selector: 'iv-gauge',
  host: {
    'data-slot': 'gauge',
    role: 'meter',
    '[attr.aria-valuemin]': 'min()',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.aria-valuetext]': 'text()',
    '[attr.aria-label]': 'label() || null',
    '[attr.data-shape]': 'shape()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shape() === 'radial') {
      <svg viewBox="0 0 100 100" class="cn-gauge-ring size-full overflow-visible" aria-hidden="true">
        @for (s of arcs(); track $index) {
          <svg:path [attr.d]="s.d" data-slot="gauge-segment" [attr.data-filled]="s.filled ? '' : null" class="cn-gauge-segment fill-none transition-colors" stroke-width="4.5" />
        }
      </svg>
      <span class="absolute inset-0 flex flex-col items-center justify-center">
        <span data-slot="gauge-value" class="cn-gauge-value text-2xl font-semibold tabular-nums tracking-tight">{{ text() }}</span>
        @if (caption()) {
          <span data-slot="gauge-caption" class="cn-gauge-caption text-muted-foreground text-xs">{{ caption() }}</span>
        }
      </span>
      <!-- The scale at the ring's two ends, so a full or empty ring reads against its range. -->
      <span data-slot="gauge-scale" class="cn-gauge-scale absolute bottom-[4%] left-[20%] -translate-x-1/2" aria-hidden="true">{{ minLabel() || min() }}</span>
      <span data-slot="gauge-scale" class="cn-gauge-scale absolute right-[20%] bottom-[4%] translate-x-1/2" aria-hidden="true">{{ maxLabel() || max() }}</span>
    } @else {
      <span class="flex h-4 flex-1 items-stretch gap-1" aria-hidden="true">
        @for (filled of capsules(); track $index) {
          <span data-slot="gauge-segment" [attr.data-filled]="filled ? '' : null" class="cn-gauge-segment w-0 flex-1 transition-colors"></span>
        }
      </span>
      <span class="flex flex-col items-end leading-tight">
        <span data-slot="gauge-value" class="cn-gauge-value text-sm font-semibold tabular-nums">{{ text() }}</span>
        @if (caption()) {
          <span data-slot="gauge-caption" class="cn-gauge-caption text-muted-foreground text-xs">{{ caption() }}</span>
        }
      </span>
    }
  `,
})
export class IvGauge {
  readonly value = input(0, { transform: numberAttribute })
  readonly min = input(0, { transform: numberAttribute })
  readonly max = input(100, { transform: numberAttribute })
  readonly shape = input<IvGaugeShape>('radial')
  /** Number of segments. Default: 24 on the ring, 10 capsules. */
  readonly segments = input<number | undefined, unknown>(undefined, { transform: optionalNumber })
  /** The text for the value. Default: the percent of the range, like "72%". */
  readonly valueText = input('')
  /** A small line under the value, like "Uptime". */
  readonly caption = input('')
  /** The text at the ring's start. Default: `min`. */
  readonly minLabel = input('')
  /** The text at the ring's end. Default: `max`. */
  readonly maxLabel = input('')
  /** Names the gauge for screen readers. */
  readonly label = input('')
  readonly class = input('')

  protected readonly clamped = computed(() => Math.min(this.max(), Math.max(this.min(), this.value())))
  private readonly fraction = computed(() => {
    const span = this.max() - this.min()
    return span > 0 ? (this.clamped() - this.min()) / span : 0
  })
  protected readonly text = computed(() => this.valueText() || `${Math.round(this.fraction() * 100)}%`)
  private readonly count = computed(() => Math.max(1, this.segments() ?? (this.shape() === 'radial' ? 24 : 10)))

  protected readonly capsules = computed(() => {
    const filled = Math.round(this.fraction() * this.count())
    return Array.from({ length: this.count() }, (_, i) => i < filled)
  })

  /** Short arcs on a 270° ring that opens at the bottom, with a gap between them. */
  protected readonly arcs = computed(() => {
    const n = this.count()
    const filled = Math.round(this.fraction() * n)
    const [cx, cy, r, start, sweep] = [50, 50, 42, 135, 270]
    const step = sweep / n
    const gap = Math.min(step * 0.4, 3)
    const point = (deg: number) => {
      const rad = (deg * Math.PI) / 180
      return `${(cx + r * Math.cos(rad)).toFixed(2)} ${(cy + r * Math.sin(rad)).toFixed(2)}`
    }
    return Array.from({ length: n }, (_, i) => {
      // Flat ends: a round cap would add half the stroke at each end and close the gap.
      const a = start + i * step + gap / 2
      const b = start + (i + 1) * step - gap / 2
      // Large-arc flag: one segment spans 267°, past half a circle.
      return { d: `M ${point(a)} A ${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${point(b)}`, filled: i < filled }
    })
  })

  protected readonly classes = computed(() =>
    cn(
      'cn-gauge',
      this.shape() === 'radial' ? 'relative inline-flex aspect-square w-40 shrink-0' : 'flex w-full items-center gap-3',
      this.class(),
    ),
  )
}

import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'

/** Optional numeric input: a static `low="20"` becomes 20; unset stays undefined (numberAttribute alone gives NaN). */
const optionalNumber = (v: unknown): number | undefined => (v == null || v === '' ? undefined : numberAttribute(v))

export type IvMeterStatus = 'good' | 'warn' | 'bad'


/**
 * A measured amount in a known range, like disk used or seats taken: a tick bar with a label at each end.
 * Like the HTML `<meter>`: `low`, `high` and `optimum` say which part of the range is good, and the bar
 * turns to warn or bad colors outside it. `ticks="0"` draws one solid bar.
 */
@Component({
  selector: 'iv-meter',
  host: {
    'data-slot': 'meter',
    '[attr.data-status]': 'status()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label() || valueText()) {
      <div data-slot="meter-header" class="cn-meter-header flex items-baseline justify-between gap-3 text-sm">
        <span data-slot="meter-label" class="cn-meter-label truncate font-medium" [id]="labelId">{{ label() }}</span>
        <span data-slot="meter-value" class="cn-meter-value text-muted-foreground shrink-0 tabular-nums">{{ valueText() }}</span>
      </div>
    }
    <div
      data-slot="meter-track"
      role="meter"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="clamped()"
      [attr.aria-valuetext]="valueText() || null"
      [attr.aria-labelledby]="label() ? labelId : null"
      [attr.aria-label]="label() ? null : ariaLabel()"
      [class]="trackClasses()"
    >
      @if (ticks() > 0) {
        @for (filled of tickStates(); track $index) {
          <span data-slot="meter-tick" [attr.data-filled]="filled ? '' : null" [class]="tickClasses()"></span>
        }
      } @else {
        <span data-slot="meter-fill" class="cn-meter-fill h-full transition-[width]" [class]="statusFill()" [style.width.%]="fraction() * 100"></span>
      }
    </div>
  `,
})
export class IvMeter {
  readonly value = input(0, { transform: numberAttribute })
  readonly min = input(0, { transform: numberAttribute })
  readonly max = input(100, { transform: numberAttribute })
  /** Below `low` is the low part of the range. */
  readonly low = input<number | undefined, unknown>(undefined, { transform: optionalNumber })
  /** Above `high` is the high part of the range. */
  readonly high = input<number | undefined, unknown>(undefined, { transform: optionalNumber })
  /** Where the best value sits. Default: the middle part (between low and high). */
  readonly optimum = input<number | undefined, unknown>(undefined, { transform: optionalNumber })
  /** Number of ticks. 0 draws a solid bar. */
  readonly ticks = input(24, { transform: numberAttribute })
  /** Shown at the start and names the meter. */
  readonly label = input('')
  /** Shown at the end, for example "68 GB of 100 GB". Also read out instead of the number. */
  readonly valueText = input('')
  /** Name when there is no visible label. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly class = input('')

  protected readonly labelId = inject(IvIdGenerator).next('iv-meter-label')

  protected readonly clamped = computed(() => Math.min(this.max(), Math.max(this.min(), this.value())))
  protected readonly fraction = computed(() => {
    const span = this.max() - this.min()
    return span > 0 ? (this.clamped() - this.min()) / span : 0
  })

  /** good, warn or bad, as the HTML meter decides it. Only when low or high is set. */
  protected readonly status = computed<IvMeterStatus | null>(() => {
    const [low, high] = [this.low(), this.high()]
    if (low === undefined && high === undefined) return null
    const lo = low ?? this.min()
    const hi = high ?? this.max()
    const region = (v: number) => (v < lo ? 0 : v > hi ? 2 : 1)
    const best = region(this.optimum() ?? (lo + hi) / 2)
    const gap = Math.abs(region(this.clamped()) - best)
    return gap === 0 ? 'good' : gap === 1 ? 'warn' : 'bad'
  })

  protected readonly tickStates = computed(() => {
    const n = this.ticks()
    const filled = Math.round(this.fraction() * n)
    return Array.from({ length: n }, (_, i) => i < filled)
  })

  // The plain look is the theme's (tools/styles/parts.css); only warn and bad recolor the fill here.
  // Literal class names, so Tailwind finds them.
  protected readonly statusFill = computed(() =>
    this.status() === 'bad' ? 'bg-destructive' : this.status() === 'warn' ? 'bg-orange-500 dark:bg-orange-400' : '',
  )

  protected readonly tickClasses = computed(() =>
    cn(
      'cn-meter-tick h-full min-w-0 flex-1 transition-colors',
      this.status() === 'bad' ? 'data-filled:bg-destructive' : this.status() === 'warn' ? 'data-filled:bg-orange-500 dark:data-filled:bg-orange-400' : '',
    ),
  )

  protected readonly trackClasses = computed(() =>
    cn('cn-meter-track flex h-1.5 w-full overflow-hidden', this.ticks() > 0 && 'gap-1'),
  )

  protected readonly classes = computed(() => cn('cn-meter flex w-full flex-col gap-2', this.class()))
}

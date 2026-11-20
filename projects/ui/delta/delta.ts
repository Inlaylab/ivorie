import { ChangeDetectionStrategy, Component, LOCALE_ID, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

export type IvDeltaTrend = 'up' | 'down' | 'flat'
export type IvDeltaTone = 'good' | 'bad' | 'neutral'

/**
 * A change against a previous period: an arrow, the signed number and a good or bad color.
 * Up is good by default; `invert` makes down good (latency, errors, cost).
 */
@Component({
  selector: 'iv-delta',
  host: {
    'data-slot': 'delta',
    '[attr.data-trend]': 'trend()',
    '[attr.data-tone]': 'tone()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 12 12" class="cn-delta-icon size-3 shrink-0" aria-hidden="true">
      @switch (trend()) {
        @case ('up') { <svg:path d="M6 2.5 10 8.5H2Z" fill="currentColor" /> }
        @case ('down') { <svg:path d="M6 9.5 2 3.5h8Z" fill="currentColor" /> }
        @default { <svg:path d="M2.5 6h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /> }
      }
    </svg>
    <span aria-hidden="true">{{ text() }}</span>
    <span class="sr-only">{{ spoken() }}</span>
  `,
})
export class IvDelta {
  /** The change. Its sign sets the arrow. */
  readonly value = input(0, { transform: numberAttribute })
  /** How the number reads: `percent` adds %, `number` shows it as it is. */
  readonly format = input<'percent' | 'number'>('percent')
  /** Down is good: for latency, errors or cost. */
  readonly invert = input(false, { transform: booleanAttribute })
  /** The text. Default: the signed value, like "+12%". */
  readonly valueText = input('')
  readonly class = input('')

  private readonly locale = inject(LOCALE_ID)
  /**
   * The value as shown (one decimal): 0.04 shows as 0%, so it reads flat, not a green "+0%".
   * With valueText the raw value sets the arrow, as documented (0.042 shown as "+4.2%").
   */
  private readonly rounded = computed(() => (this.valueText() ? this.value() : Math.round(this.value() * 10) / 10 || 0))
  protected readonly trend = computed<IvDeltaTrend>(() => (this.rounded() > 0 ? 'up' : this.rounded() < 0 ? 'down' : 'flat'))
  protected readonly tone = computed<IvDeltaTone>(() => {
    if (this.trend() === 'flat') return 'neutral'
    return (this.trend() === 'up') !== this.invert() ? 'good' : 'bad'
  })
  protected readonly text = computed(() => {
    if (this.valueText()) return this.valueText()
    const v = this.rounded()
    const sign = v > 0 ? '+' : v < 0 ? '−' : ''
    const abs = Math.abs(v).toLocaleString(this.locale, { maximumFractionDigits: 1 })
    return `${sign}${abs}${this.format() === 'percent' ? '%' : ''}`
  })
  /** Read out in words: the arrow alone says nothing to a screen reader. */
  protected readonly spoken = computed(() => {
    const word = { up: 'Up', down: 'Down', flat: 'No change' }[this.trend()]
    return this.trend() === 'flat' ? word : `${word} ${this.text().replace(/^[+−]/, '')}`
  })

  protected readonly classes = computed(() =>
    cn(
      'cn-delta inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap tabular-nums',
      this.class(),
    ),
  )
}

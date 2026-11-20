import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'
import { tooltipPanelClasses } from '@inlaylab/ivorie/tooltip'

export type IvTrackerStatus = 'ok' | 'warn' | 'error' | 'none'

export interface IvTrackerItem {
  /** Sets the color: ok, warn, error, or none (no data). */
  status: IvTrackerStatus
  /** Shown on hover and focus, and read out, like "Nov 3: operational". */
  tooltip: string
}

/**
 * A row of thin bars, one per day or per check, colored by status: uptime, CI runs, cron jobs.
 * One tab stop: arrow keys move between bars, and the hovered or focused bar shows its tooltip.
 */
@Component({
  selector: 'iv-tracker',
  host: {
    'data-slot': 'tracker',
    role: 'group',
    '[attr.aria-label]': 'label() || null',
    '[class]': 'classes()',
    '(pointerleave)': 'hovered.set(null)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of data(); track $index; let i = $index) {
      <span
        data-slot="tracker-bar"
        role="img"
        [attr.aria-label]="item.tooltip"
        [attr.data-status]="item.status"
        [attr.tabindex]="i === focusIndex() ? 0 : -1"
        class="cn-tracker-bar h-full min-w-0 flex-1 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring"
        [class.opacity-60]="shown() !== null && shown() !== i"
        (pointerenter)="hovered.set(i)"
        (focus)="focused.set(i); lastFocus.set(i)"
        (blur)="focused.set(null)"
        (keydown)="onKey($event, i)"
      ></span>
    }
    @if (shown() !== null) {
      <span data-slot="tracker-tooltip" aria-hidden="true" [class]="tipClasses()" [style.left]="tipLeft()">
        {{ data()[shown()!].tooltip }}
      </span>
    }
  `,
})
export class IvTracker {
  readonly data = input<IvTrackerItem[]>([])
  /** Names the whole row, like "API uptime, last 90 days". */
  readonly label = input('')
  readonly class = input('')

  // Reset when data changes: a removed bar may never fire blur or pointerleave.
  protected readonly hovered = linkedSignal<IvTrackerItem[], number | null>({ source: this.data, computation: () => null })
  protected readonly focused = linkedSignal<IvTrackerItem[], number | null>({ source: this.data, computation: () => null })
  /** The roving tab stop: the last bar until one is focused. */
  protected readonly lastFocus = signal<number | null>(null)
  // Clamped: data can shrink (90 days to 30) after a bar had focus, and one bar must stay reachable.
  protected readonly focusIndex = computed(() => Math.min(this.lastFocus() ?? Infinity, this.data().length - 1))
  protected readonly shown = computed(() => {
    const i = this.hovered() ?? this.focused()
    return i !== null && i < this.data().length ? i : null
  })
  /** Centered on the bar, kept inside the row near either end. */
  protected readonly tipLeft = computed(() => {
    const pct = (((this.shown() ?? 0) + 0.5) / Math.max(1, this.data().length)) * 100
    return `clamp(4rem, ${pct}%, calc(100% - 4rem))`
  })

  protected onKey(event: KeyboardEvent, i: number): void {
    const last = this.data().length - 1
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: last }[event.key]
    if (next === undefined) return
    event.preventDefault()
    const target = Math.min(last, Math.max(0, next))
    this.lastFocus.set(target)
    const bars = (event.currentTarget as HTMLElement).parentElement!.querySelectorAll<HTMLElement>('[data-slot="tracker-bar"]')
    bars[target]?.focus()
  }

  protected readonly tipClasses = computed(() =>
    cn(tooltipPanelClasses(''), 'cn-tracker-tooltip pointer-events-none absolute bottom-full mb-2 -translate-x-1/2 whitespace-nowrap'),
  )

  protected readonly classes = computed(() => cn('cn-tracker relative flex h-8 w-full items-stretch gap-[2px]', this.class()))
}

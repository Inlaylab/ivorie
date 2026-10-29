import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cn } from '@ivorie/ui/core'

@Component({
  selector: 'iv-progress',
  host: {
    'data-slot': 'progress',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.data-state]': 'state()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-slot="progress-indicator"
      class="cn-progress-indicator size-full flex-1 transition-all"
      [style.transform]="'translateX(-' + (100 - (clamped() ?? 0)) + '%)'"
    ></div>
  `,
})
export class IvProgress {
  /** 0–100, clamped. `null` (or NaN) means indeterminate. */
  readonly value = input<number | null>(0);
  readonly class = input('');

  protected readonly clamped = computed(() => {
    const v = this.value()
    return v == null || Number.isNaN(v) ? null : Math.max(0, Math.min(100, v))
  })

  protected readonly state = computed(() => {
    const v = this.clamped()
    return v == null ? 'indeterminate' : v === 100 ? 'complete' : 'loading'
  })

  protected readonly classes = computed(() =>
    cn('cn-progress relative flex w-full items-center overflow-x-hidden', this.class())
  )
}

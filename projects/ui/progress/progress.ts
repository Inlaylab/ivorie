import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

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
      [class]="indicatorClasses()"
      [style.transform]="clamped() == null ? null : 'translateX(-' + (100 - clamped()!) + '%)'"
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

  // Indeterminate: a short segment slides across instead of a full bar parked off-screen.
  protected readonly indicatorClasses = computed(() =>
    cn(
      'cn-progress-indicator',
      this.clamped() == null
        ? 'absolute inset-y-0 w-2/5 [border-radius:inherit] animate-progress-indeterminate motion-reduce:left-0 motion-reduce:w-full motion-reduce:animate-[pulse_2.4s_ease-in-out_infinite]'
        : 'size-full flex-1 transition-all',
    )
  )

  protected readonly classes = computed(() =>
    cn('cn-progress relative flex w-full items-center overflow-x-hidden', this.class())
  )
}

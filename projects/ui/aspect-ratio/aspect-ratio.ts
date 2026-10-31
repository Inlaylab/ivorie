import { Component, ChangeDetectionStrategy, computed, input, numberAttribute } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

// CSS aspect-ratio replaces Radix's padding-bottom wrapper; children fill it with size-full.
@Component({
  selector: 'iv-aspect-ratio',
  host: {
    'data-slot': 'aspect-ratio',
    '[style.--ratio]': 'ratio()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAspectRatio {
  /** Width divided by height, e.g. `16 / 9`. */
  readonly ratio = input(1, { transform: numberAttribute });
  readonly class = input('');

  protected readonly classes = computed(() => cn('relative block aspect-(--ratio) w-full', this.class()))
}

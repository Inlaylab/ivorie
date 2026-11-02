import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { IvIcon } from '@inlaylab/ivorie/icon'
import { cn } from '@inlaylab/ivorie/core'

@Component({
  selector: 'iv-spinner',
  imports: [IvIcon],
  host: {
    'data-slot': 'spinner',
    role: 'status',
    '[attr.aria-label]': 'label()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg ivIcon="loader-circle" [size]="size()" aria-hidden="true"></svg>`,
})
export class IvSpinner {
  readonly size = input(16);
  readonly label = input('Loading');
  readonly class = input('');

  protected readonly classes = computed(() => cn('inline-flex animate-spin motion-reduce:animate-[spin_2.4s_linear_infinite]', this.class()))
}

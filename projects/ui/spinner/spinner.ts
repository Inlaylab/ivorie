import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { LucideLoaderCircle } from '@lucide/angular'
import { cn } from '@ivorie/ui/core'

@Component({
  selector: 'iv-spinner',
  imports: [LucideLoaderCircle],
  host: {
    'data-slot': 'spinner',
    role: 'status',
    '[attr.aria-label]': 'label()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg lucideLoaderCircle [size]="size()" aria-hidden="true"></svg>`,
})
export class IvSpinner {
  readonly size = input(16);
  readonly label = input('Loading');
  readonly class = input('');

  protected readonly classes = computed(() => cn('inline-flex animate-spin motion-reduce:animate-[spin_2.4s_linear_infinite]', this.class()))
}

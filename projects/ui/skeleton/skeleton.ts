import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cn } from '@ivorie/ui/core'

@Component({
  selector: 'iv-skeleton',
  host: {
    'data-slot': 'skeleton',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvSkeleton {
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-skeleton block animate-pulse', this.class()))
}

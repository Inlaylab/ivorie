import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

@Component({
  selector: 'iv-separator',
  host: {
    'data-slot': 'separator',
    '[attr.role]': 'decorative() ? "none" : "separator"',
    '[attr.aria-orientation]': 'decorative() ? null : orientation()',
    '[attr.data-orientation]': 'orientation()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly decorative = input(true);
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'block shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
      this.class(),
    )
  )
}

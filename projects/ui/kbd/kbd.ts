import { Directive, computed, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

@Directive({
  selector: 'kbd[ivKbd]',
  host: {
    'data-slot': 'kbd',
    '[class]': 'classes()',
  },
})
export class IvKbd {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-kbd pointer-events-none inline-flex items-center justify-center select-none', this.class())
  )
}

@Directive({
  selector: 'kbd[ivKbdGroup]',
  host: {
    'data-slot': 'kbd-group',
    '[class]': 'classes()',
  },
})
export class IvKbdGroup {
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-kbd-group inline-flex items-center', this.class()))
}

export const IV_KBD_IMPORTS = [IvKbd, IvKbdGroup] as const

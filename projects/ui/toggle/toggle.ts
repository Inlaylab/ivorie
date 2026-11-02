import { Directive, computed, input, model } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@inlaylab/ivorie/core'

export const toggleVariants = cva(
  'cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'cn-toggle-variant-default',
        outline: 'cn-toggle-variant-outline',
      },
      size: {
        default: 'cn-toggle-size-default',
        sm: 'cn-toggle-size-sm',
        lg: 'cn-toggle-size-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ToggleVariants = VariantProps<typeof toggleVariants>

/** A two-state button. Disable it with the native `disabled` attribute. */
@Directive({
  selector: 'button[ivToggle]',
  host: {
    'type': 'button',
    'data-slot': 'toggle',
    '[attr.data-variant]': 'variant() ?? "default"',
    '[attr.data-size]': 'size() ?? "default"',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.data-state]': 'pressed() ? "on" : "off"',
    '[class]': 'classes()',
    '(click)': 'pressed.set(!pressed())',
  },
})
export class IvToggle {
  readonly pressed = model(false)
  readonly variant = input<ToggleVariants['variant']>('default')
  readonly size = input<ToggleVariants['size']>('default')
  readonly class = input('')

  protected readonly classes = computed(() =>
    cn(toggleVariants({ variant: this.variant(), size: this.size() }), this.class())
  )
}

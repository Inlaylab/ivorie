import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@inlaylab/ivorie/core'

export const badgeVariants = cva(
  "cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      // Ring colour sits per variant: shadcn lets the destructive rule override the base one.
      variant: {
        default: "cn-badge-variant-default focus-visible:ring-ring/50",
        secondary: "cn-badge-variant-secondary focus-visible:ring-ring/50",
        destructive: "cn-badge-variant-destructive",
        outline: "cn-badge-variant-outline focus-visible:ring-ring/50",
        ghost: "cn-badge-variant-ghost focus-visible:ring-ring/50",
        link: "cn-badge-variant-link focus-visible:ring-ring/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>

@Component({
  selector: 'iv-badge',
  host: {
    'data-slot': 'badge',
    '[attr.data-variant]': 'variant()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvBadge {
  readonly variant = input<BadgeVariants['variant']>('default');
  readonly class = input('');

  protected readonly classes = computed(() => cn(badgeVariants({ variant: this.variant() }), this.class()))
}

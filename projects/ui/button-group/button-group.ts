import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@ivorie/ui/core'

export const buttonGroupVariants = cva(
  "cn-button-group group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          'cn-button-group-orientation-horizontal [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'cn-button-group-orientation-vertical flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>

@Component({
  selector: 'iv-button-group',
  host: {
    role: 'group',
    'data-slot': 'button-group',
    '[attr.data-orientation]': 'orientation()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvButtonGroup {
  readonly orientation = input<ButtonGroupVariants['orientation']>('horizontal');
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(buttonGroupVariants({ orientation: this.orientation() }), this.class())
  )
}

@Component({
  selector: 'iv-button-group-text',
  host: {
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvButtonGroupText {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-button-group-text flex items-center [&_svg]:pointer-events-none', this.class())
  )
}

// Same host attributes as IvSeparator (decorative), plus the group's own hook. The hook sets the colour.
@Component({
  selector: 'iv-button-group-separator',
  host: {
    'data-slot': 'button-group-separator',
    role: 'none',
    '[attr.data-orientation]': 'orientation()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvButtonGroupSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
      'cn-button-group-separator relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto',
      this.class(),
    )
  )
}

export const IV_BUTTON_GROUP_IMPORTS = [
  IvButtonGroup,
  IvButtonGroupText,
  IvButtonGroupSeparator,
] as const

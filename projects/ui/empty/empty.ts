import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@inlaylab/ivorie/core'

export const emptyMediaVariants = cva(
  'cn-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'cn-empty-media-default',
        icon: 'cn-empty-media-icon',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>

@Component({
  selector: 'iv-empty',
  host: {
    'data-slot': 'empty',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvEmpty {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance', this.class())
  )
}

@Component({
  selector: 'iv-empty-header',
  host: {
    'data-slot': 'empty-header',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvEmptyHeader {
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-empty-header flex max-w-sm flex-col items-center', this.class()))
}

@Component({
  selector: 'iv-empty-media',
  host: {
    'data-slot': 'empty-icon',
    '[attr.data-variant]': 'variant()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvEmptyMedia {
  readonly variant = input<EmptyMediaVariants['variant']>('default');
  readonly class = input('');

  protected readonly classes = computed(() => cn(emptyMediaVariants({ variant: this.variant() }), this.class()))
}

@Component({
  selector: 'iv-empty-title',
  host: {
    'data-slot': 'empty-title',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvEmptyTitle {
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-empty-title cn-font-heading', this.class()))
}

@Component({
  selector: 'iv-empty-description',
  host: {
    'data-slot': 'empty-description',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvEmptyDescription {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-empty-description text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary', this.class())
  )
}

@Component({
  selector: 'iv-empty-content',
  host: {
    'data-slot': 'empty-content',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvEmptyContent {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance', this.class())
  )
}

export const IV_EMPTY_IMPORTS = [
  IvEmpty,
  IvEmptyHeader,
  IvEmptyMedia,
  IvEmptyTitle,
  IvEmptyDescription,
  IvEmptyContent,
] as const

import { Component, ChangeDetectionStrategy, ElementRef, computed, inject, input } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@ivorie/ui/core'

@Component({
  selector: 'iv-item-group',
  host: {
    'data-slot': 'item-group',
    role: 'list',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemGroup {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-item-group group/item-group flex w-full flex-col", this.class())
  )
}

export const itemVariants = cva(
  'cn-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors',
  {
    variants: {
      variant: {
        default: 'cn-item-variant-default',
        outline: 'cn-item-variant-outline',
        muted: 'cn-item-variant-muted',
      },
      size: {
        default: 'cn-item-size-default',
        sm: 'cn-item-size-sm',
        xs: 'cn-item-size-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ItemVariants = VariantProps<typeof itemVariants>

@Component({
  selector: 'iv-item',
  host: {
    'data-slot': 'item',
    // The group is role="list": its direct children must be listitems, nested ones must not.
    '[attr.role]': 'role()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItem {
  private host: ElementRef<HTMLElement> = inject(ElementRef)

  // Read on render: the host has no parent yet in the constructor.
  protected role() {
    return this.host.nativeElement.parentElement?.getAttribute('data-slot') === 'item-group' ? 'listitem' : null
  }

  readonly variant = input<ItemVariants['variant']>('default');
  readonly size = input<ItemVariants['size']>('default');
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(itemVariants({ variant: this.variant(), size: this.size() }), this.class())
  )
}

export const itemMediaVariants = cva(
  'cn-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'cn-item-media-variant-default',
        icon: 'cn-item-media-variant-icon',
        image: 'cn-item-media-variant-image',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type ItemMediaVariants = VariantProps<typeof itemMediaVariants>

@Component({
  selector: 'iv-item-media',
  host: {
    'data-slot': 'item-media',
    '[attr.data-variant]': 'variant()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemMedia {
  readonly variant = input<ItemMediaVariants['variant']>('default');
  readonly class = input('');

  protected readonly classes = computed(() => cn(itemMediaVariants({ variant: this.variant() }), this.class()))
}

@Component({
  selector: 'iv-item-content',
  host: {
    'data-slot': 'item-content',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemContent {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none", this.class())
  )
}

@Component({
  selector: 'iv-item-title',
  host: {
    'data-slot': 'item-title',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemTitle {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-item-title line-clamp-1 flex w-fit items-center", this.class())
  )
}

@Component({
  selector: 'iv-item-description, p[ivItemDescription]',
  host: {
    'data-slot': 'item-description',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemDescription {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", this.class())
  )
}

@Component({
  selector: 'iv-item-actions',
  host: {
    'data-slot': 'item-actions',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemActions {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-item-actions flex items-center", this.class())
  )
}

@Component({
  selector: 'iv-item-header',
  host: {
    'data-slot': 'item-header',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemHeader {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-item-header flex basis-full items-center justify-between", this.class())
  )
}

@Component({
  selector: 'iv-item-footer',
  host: {
    'data-slot': 'item-footer',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvItemFooter {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-item-footer flex basis-full items-center justify-between", this.class())
  )
}

// A decorative horizontal separator (shadcn: <Separator orientation="horizontal">).
@Component({
  selector: 'iv-item-separator',
  host: {
    'data-slot': 'item-separator',
    role: 'none',
    'data-orientation': 'horizontal',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvItemSeparator {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full cn-item-separator', this.class())
  )
}

export const IV_ITEM_IMPORTS = [
  IvItemGroup,
  IvItem,
  IvItemMedia,
  IvItemContent,
  IvItemTitle,
  IvItemDescription,
  IvItemActions,
  IvItemHeader,
  IvItemFooter,
  IvItemSeparator,
] as const

import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cn } from '@ivorie/ui/core'

@Component({
  selector: 'iv-card',
  host: {
    'data-slot': 'card',
    '[attr.data-size]': 'size()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCard {
  readonly size = input<'default' | 'sm'>('default');
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-card group/card flex flex-col', this.class())
  )
}

@Component({
  selector: 'iv-card-header',
  host: {
    'data-slot': 'card-header',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCardHeader {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-card-header group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]', this.class())
  )
}

@Component({
  selector: 'iv-card-title',
  host: {
    'data-slot': 'card-title',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCardTitle {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-card-title', this.class())
  )
}

@Component({
  selector: 'iv-card-description',
  host: {
    'data-slot': 'card-description',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCardDescription {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-card-description', this.class())
  )
}

@Component({
  selector: 'iv-card-action',
  host: {
    'data-slot': 'card-action',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCardAction {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end', this.class())
  )
}

@Component({
  selector: 'iv-card-content',
  host: {
    'data-slot': 'card-content',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCardContent {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-card-content', this.class())
  )
}

@Component({
  selector: 'iv-card-footer',
  host: {
    'data-slot': 'card-footer',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCardFooter {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-card-footer flex items-center', this.class())
  )
}

export const IV_CARD_IMPORTS = [
  IvCard,
  IvCardHeader,
  IvCardTitle,
  IvCardDescription,
  IvCardAction,
  IvCardContent,
  IvCardFooter,
] as const

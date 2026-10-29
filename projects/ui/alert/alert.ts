import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@ivorie/ui/core'

export const alertVariants = cva('cn-alert group/alert relative w-full', {
  variants: {
    variant: {
      default: 'cn-alert-variant-default',
      destructive: 'cn-alert-variant-destructive',
      // Ivorie-only variants: no shadcn style has them, so they keep plain utilities in every theme.
      warning:
        'border-yellow-200 bg-yellow-50 text-yellow-900 *:data-[slot=alert-description]:text-yellow-800/90 *:[svg]:text-yellow-600',
      success:
        'border-green-200 bg-green-50 text-green-900 *:data-[slot=alert-description]:text-green-800/90 *:[svg]:text-green-600',
      info: 'border-blue-200 bg-blue-50 text-blue-900 *:data-[slot=alert-description]:text-blue-800/90 *:[svg]:text-blue-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type AlertVariants = VariantProps<typeof alertVariants>

@Component({
  selector: 'iv-alert',
  host: {
    'data-slot': 'alert',
    role: 'alert',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlert {
  readonly variant = input<AlertVariants['variant']>('default');
  readonly class = input('');

  protected readonly classes = computed(() => cn(alertVariants({ variant: this.variant() }), this.class()))
}

@Component({
  selector: 'iv-alert-title',
  host: {
    'data-slot': 'alert-title',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertTitle {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-alert-title [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", this.class())
  )
}

@Component({
  selector: 'iv-alert-description',
  host: {
    'data-slot': 'alert-description',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertDescription {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", this.class())
  )
}

@Component({
  selector: 'iv-alert-action',
  host: {
    'data-slot': 'alert-action',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertAction {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-alert-action", this.class())
  )
}

export const IV_ALERT_IMPORTS = [
  IvAlert,
  IvAlertTitle,
  IvAlertDescription,
  IvAlertAction,
] as const

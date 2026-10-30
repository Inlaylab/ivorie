import { Component, Directive, ElementRef, inject, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { buttonVariants, ButtonVariants } from '@inlaylab/ivorie/button'
import { cn } from '@inlaylab/ivorie/core'

const INPUT_BASE =
  'cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

const TEXTAREA_BASE =
  'cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'

@Directive({
  selector: 'input[ivInput]',
  host: {
    'data-slot': 'input',
    '[class]': 'classes()',
  },
})
export class IvInput {
  readonly class = input('');

  protected readonly classes = computed(() => cn(INPUT_BASE, this.class()))
}

@Directive({
  selector: 'textarea[ivTextarea]',
  host: {
    'data-slot': 'textarea',
    '[class]': 'classes()',
  },
})
export class IvTextarea {
  readonly class = input('');

  protected readonly classes = computed(() => cn(TEXTAREA_BASE, this.class()))
}

@Directive({
  selector: 'label[ivLabel]',
  host: {
    'data-slot': 'label',
    '[class]': 'classes()',
  },
})
export class IvLabel {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed',
      this.class(),
    )
  )
}

@Component({
  selector: 'iv-input-group',
  host: {
    'data-slot': 'input-group',
    role: 'group',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvInputGroup {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto',
      this.class(),
    )
  )
}

const inputGroupAddonVariants = cva(
  'cn-input-group-addon flex cursor-text items-center justify-center select-none',
  {
    variants: {
      align: {
        'inline-start': 'cn-input-group-addon-align-inline-start order-first',
        'inline-end': 'cn-input-group-addon-align-inline-end order-last',
        'block-start': 'cn-input-group-addon-align-block-start order-first w-full justify-start',
        'block-end': 'cn-input-group-addon-align-block-end order-last w-full justify-start',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

type InputGroupAddonVariants = VariantProps<typeof inputGroupAddonVariants>

@Component({
  selector: 'iv-input-group-addon',
  host: {
    role: 'group',
    'data-slot': 'input-group-addon',
    '[attr.data-align]': 'align()',
    '[class]': 'classes()',
    '(click)': 'onClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvInputGroupAddon {
  private host: ElementRef<HTMLElement> = inject(ElementRef)

  readonly align = input<InputGroupAddonVariants['align']>('inline-start');
  readonly class = input('');

  protected readonly classes = computed(() => cn(inputGroupAddonVariants({ align: this.align() }), this.class()))

  onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('button')) return
    this.host.nativeElement.parentElement?.querySelector('input')?.focus()
  }
}

@Component({
  selector: 'iv-input-group-text',
  host: {
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvInputGroupText {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-input-group-text flex items-center [&_svg]:pointer-events-none', this.class())
  )
}

const inputGroupButtonVariants = cva('cn-input-group-button flex items-center shadow-none', {
  variants: {
    size: {
      xs: 'cn-input-group-button-size-xs',
      sm: 'cn-input-group-button-size-sm',
      'icon-xs': 'cn-input-group-button-size-icon-xs',
      'icon-sm': 'cn-input-group-button-size-icon-sm',
    },
  },
  defaultVariants: {
    size: 'xs',
  },
})

type InputGroupButtonVariants = VariantProps<typeof inputGroupButtonVariants>

// A button styled like IvButton, sized for the group (shadcn: <Button> + group size hooks).
@Component({
  selector: 'iv-input-group-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      data-slot="button"
      [attr.type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
      [class]="classes()"
    >
      <ng-content />
    </button>
  `,
})
export class IvInputGroupButton {
  readonly variant = input<ButtonVariants['variant']>('ghost');
  readonly size = input<InputGroupButtonVariants['size']>('xs');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({ variant: this.variant() }),
      inputGroupButtonVariants({ size: this.size() }),
      this.class(),
    )
  )
}

@Directive({
  selector: 'input[ivInputGroupInput]',
  host: {
    'data-slot': 'input-group-control',
    '[class]': 'classes()',
  },
})
export class IvInputGroupInput {
  readonly class = input('');

  protected readonly classes = computed(() => cn(INPUT_BASE, 'cn-input-group-input flex-1', this.class()))
}

@Directive({
  selector: 'textarea[ivInputGroupTextarea]',
  host: {
    'data-slot': 'input-group-control',
    '[class]': 'classes()',
  },
})
export class IvInputGroupTextarea {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(TEXTAREA_BASE, 'cn-input-group-textarea flex-1 resize-none', this.class())
  )
}

export const IV_INPUT_IMPORTS = [
  IvInput,
  IvTextarea,
  IvLabel,
  IvInputGroup,
  IvInputGroupAddon,
  IvInputGroupText,
  IvInputGroupButton,
  IvInputGroupInput,
  IvInputGroupTextarea,
] as const

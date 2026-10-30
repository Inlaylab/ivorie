import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@inlaylab/ivorie/core'

@Component({
  selector: 'iv-field-set, fieldset[ivFieldSet]',
  host: {
    'data-slot': 'field-set',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvFieldSet {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-field-set flex flex-col", this.class())
  )
}

@Component({
  selector: 'iv-field-legend, legend[ivFieldLegend]',
  host: {
    'data-slot': 'field-legend',
    '[attr.data-variant]': 'variant()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvFieldLegend {
  readonly variant = input<'legend' | 'label'>('legend');
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-field-legend', this.class()))
}

@Component({
  selector: 'iv-field-group',
  host: {
    'data-slot': 'field-group',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvFieldGroup {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-field-group group/field-group @container/field-group flex w-full flex-col", this.class())
  )
}

export const fieldVariants = cva('cn-field group/field flex w-full', {
  variants: {
    orientation: {
      vertical: 'cn-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'cn-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

export type FieldVariants = VariantProps<typeof fieldVariants>

@Component({
  selector: 'iv-field',
  host: {
    role: 'group',
    'data-slot': 'field',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-invalid]': 'invalid() ? "true" : null',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvField {
  readonly orientation = input<FieldVariants['orientation']>('vertical');
  readonly invalid = input(false);
  readonly class = input('');

  protected readonly classes = computed(() => cn(fieldVariants({ orientation: this.orientation() }), this.class()))
}

@Component({
  selector: 'iv-field-content',
  host: {
    'data-slot': 'field-content',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvFieldContent {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-field-content group/field-content flex flex-1 flex-col leading-snug", this.class())
  )
}

@Component({
  selector: 'iv-field-title',
  host: {
    'data-slot': 'field-label',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvFieldTitle {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-field-title flex w-fit items-center", this.class())
  )
}

@Component({
  selector: 'iv-field-description, p[ivFieldDescription]',
  host: {
    'data-slot': 'field-description',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvFieldDescription {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn("cn-field-description leading-normal font-normal group-has-data-horizontal/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", this.class())
  )
}

// Renders nothing (and takes no space) unless it has a message or projected content.
@Component({
  selector: 'iv-field-error',
  host: {
    role: 'alert',
    'data-slot': 'field-error',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (message()) { {{ message() }} }<ng-content />`,
})
export class IvFieldError {
  readonly message = input('');
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-field-error font-normal empty:hidden', this.class()))
}

@Component({
  selector: 'iv-field-separator',
  host: {
    'data-slot': 'field-separator',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="absolute inset-0 top-1/2 h-px bg-border"></div>
    <span
      class="cn-field-separator-content relative mx-auto block w-fit bg-background empty:hidden"
      data-slot="field-separator-content"
    ><ng-content /></span>
  `,
})
export class IvFieldSeparator {
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-field-separator relative', this.class()))
}

export const IV_FIELD_IMPORTS = [
  IvFieldSet,
  IvFieldLegend,
  IvFieldGroup,
  IvField,
  IvFieldContent,
  IvFieldTitle,
  IvFieldDescription,
  IvFieldError,
  IvFieldSeparator,
] as const

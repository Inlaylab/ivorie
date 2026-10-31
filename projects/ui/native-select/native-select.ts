import { Component, Directive, ChangeDetectionStrategy, computed, inject, input } from '@angular/core'
import { LucideChevronDown } from '@lucide/angular'
import { cn } from '@inlaylab/ivorie/core'

export type NativeSelectSize = 'default' | 'sm'

/** Wrapper: holds a `select[ivNativeSelect]` and draws the chevron over it. */
@Component({
  selector: 'iv-native-select',
  imports: [LucideChevronDown],
  host: {
    'data-slot': 'native-select-wrapper',
    '[attr.data-size]': 'size()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <svg
      lucideChevronDown
      data-slot="native-select-icon"
      class="cn-native-select-icon pointer-events-none absolute select-none"
      aria-hidden="true"
    ></svg>
  `,
})
export class IvNativeSelectWrapper {
  readonly size = input<NativeSelectSize>('default');
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-native-select-wrapper group/native-select relative block w-fit has-[select:disabled]:opacity-50', this.class())
  )
}

// A plain select: Angular's built-in select value accessor handles forms and ngModel.
@Directive({
  selector: 'select[ivNativeSelect]',
  host: {
    'data-slot': 'native-select',
    '[attr.data-size]': 'wrapper?.size() ?? "default"',
    '[class]': 'classes()',
  },
})
export class IvNativeSelect {
  readonly class = input('');

  protected readonly wrapper = inject(IvNativeSelectWrapper, { optional: true })
  protected readonly classes = computed(() =>
    cn('cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed', this.class())
  )
}

@Directive({
  selector: 'option[ivNativeSelectOption]',
  host: {
    'data-slot': 'native-select-option',
    '[class]': 'classes()',
  },
})
export class IvNativeSelectOption {
  readonly class = input('');

  protected readonly classes = computed(() => cn('bg-[Canvas] text-[CanvasText]', this.class()))
}

@Directive({
  selector: 'optgroup[ivNativeSelectOptGroup]',
  host: {
    'data-slot': 'native-select-optgroup',
    '[class]': 'classes()',
  },
})
export class IvNativeSelectOptGroup {
  readonly class = input('');

  protected readonly classes = computed(() => cn('bg-[Canvas] text-[CanvasText]', this.class()))
}

export const IV_NATIVE_SELECT_IMPORTS = [
  IvNativeSelectWrapper,
  IvNativeSelect,
  IvNativeSelectOption,
  IvNativeSelectOptGroup,
] as const

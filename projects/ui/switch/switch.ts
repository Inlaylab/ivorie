import {
  Component,
  forwardRef,
  ChangeDetectionStrategy,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { cn } from '@inlaylab/ivorie/core'

// The switch is a native <button> (like Radix): <label for>, focus, Space and Enter work without extra code.
@Component({
  selector: 'iv-switch',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IvSwitch),
      multi: true,
    },
  ],
  host: {
    style: 'display: contents',
    // id, aria-label and aria-labelledby move to the button.
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      data-slot="switch"
      [attr.id]="id()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [attr.aria-checked]="_checked()"
      [attr.data-state]="state()"
      [attr.data-size]="size()"
      [attr.data-disabled]="isDisabled() ? '' : null"
      [disabled]="isDisabled()"
      [class]="classes()"
      (click)="toggle()"
      (blur)="_onTouched()"
    >
      <span
        data-slot="switch-thumb"
        class="cn-switch-thumb pointer-events-none block ring-0 transition-transform"
        [attr.data-state]="state()"
        [attr.data-disabled]="isDisabled() ? '' : null"
      ></span>
    </button>
  `,
})
export class IvSwitch implements ControlValueAccessor {
  readonly checked = input(false)
  readonly size = input<'default' | 'sm'>('default');
  readonly disabled = input(false)
  readonly id = input<string | null>(null)
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' })
  readonly class = input('');

  readonly checkedChange = output<boolean>();

  // Local state: user toggles and the form write here; a new input value resets it.
  protected readonly _checked = linkedSignal(this.checked)
  // Two sources, so a later [disabled] change cannot re-enable a form-disabled control.
  private readonly _formDisabled = signal(false)
  protected readonly isDisabled = computed(() => this.disabled() || this._formDisabled())

  protected readonly state = computed(() => (this._checked() ? 'checked' : 'unchecked'))

  protected readonly classes = computed(() =>
    cn(
      'cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50',
      this.class(),
    )
  )

  private _onChange = (_: boolean) => {}
  protected _onTouched = () => {}

  protected toggle() {
    if (this.isDisabled()) return
    this._checked.update((v) => !v)
    this._onChange(this._checked())
    this.checkedChange.emit(this._checked())
  }

  writeValue(val: boolean) { this._checked.set(!!val) }
  registerOnChange(fn: (_: boolean) => void) { this._onChange = fn }
  registerOnTouched(fn: () => void) { this._onTouched = fn }
  setDisabledState(isDisabled: boolean) { this._formDisabled.set(isDisabled) }
}

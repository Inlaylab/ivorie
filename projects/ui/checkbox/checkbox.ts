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
import { LucideCheck, LucideMinus } from '@lucide/angular'
import { cn } from '@inlaylab/ivorie/core'

// The checkbox is a native <button> (like Radix), so <label for> and focus work without extra code.
@Component({
  selector: 'iv-checkbox',
  imports: [LucideMinus, LucideCheck],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IvCheckbox),
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
      role="checkbox"
      data-slot="checkbox"
      [attr.id]="id()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [attr.aria-checked]="_indeterminate() ? 'mixed' : _checked()"
      [attr.data-state]="state()"
      [disabled]="isDisabled()"
      [class]="classes()"
      (click)="toggle()"
      (keydown.enter)="$event.preventDefault()"
      (blur)="_onTouched()"
    >
      <span data-slot="checkbox-indicator" class="cn-checkbox-indicator grid place-content-center text-current transition-none">
        @if (_indeterminate()) {
          <svg lucideMinus aria-hidden="true"></svg>
        } @else if (_checked()) {
          <svg lucideCheck aria-hidden="true"></svg>
        }
      </span>
    </button>
  `,
})
export class IvCheckbox implements ControlValueAccessor {
  readonly checked = input(false)
  readonly indeterminate = input(false)
  readonly disabled = input(false)
  readonly id = input<string | null>(null)
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' })
  readonly class = input('');

  readonly checkedChange = output<boolean>();

  // Local state: user toggles and the form write here; a new input value resets it.
  protected readonly _checked = linkedSignal(this.checked)
  protected readonly _indeterminate = linkedSignal(this.indeterminate)
  // Two sources, so a later [disabled] change cannot re-enable a form-disabled control.
  private readonly _formDisabled = signal(false)
  protected readonly isDisabled = computed(() => this.disabled() || this._formDisabled())

  protected readonly state = computed(() =>
    this._indeterminate() ? 'indeterminate' : this._checked() ? 'checked' : 'unchecked'
  )

  protected readonly classes = computed(() =>
    cn(
      'cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50',
      this.class(),
    )
  )

  private _onChange = (_: boolean) => {}
  protected _onTouched = () => {}

  protected toggle() {
    if (this.isDisabled()) return
    if (this._indeterminate()) {
      this._indeterminate.set(false)
      this._checked.set(true)
    } else {
      this._checked.update((v) => !v)
    }
    this._onChange(this._checked())
    this.checkedChange.emit(this._checked())
  }

  writeValue(val: boolean) { this._checked.set(!!val) }
  registerOnChange(fn: (_: boolean) => void) { this._onChange = fn }
  registerOnTouched(fn: () => void) { this._onTouched = fn }
  setDisabledState(isDisabled: boolean) { this._formDisabled.set(isDisabled) }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { LucideMinus } from '@lucide/angular'
import { cn } from '@inlaylab/ivorie/core'

/** Allows digits only; pass to `pattern`. */
export const REGEXP_ONLY_DIGITS = '^\\d+$'
/** Allows digits and Latin letters; pass to `pattern`. */
export const REGEXP_ONLY_DIGITS_AND_CHARS = '^[a-zA-Z0-9]+$'

/**
 * One real input, laid transparent over the slots: typing, paste, autofill (`one-time-code`) and
 * screen readers all use the native input. The slots only draw its characters.
 */
@Component({
  selector: 'iv-input-otp',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IvInputOtp), multi: true }],
  host: {
    'data-slot': 'input-otp',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <input
      class="cn-input-otp-input absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
      autocomplete="one-time-code"
      [attr.inputmode]="pattern() === digits ? 'numeric' : 'text'"
      [attr.maxlength]="maxLength()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [attr.id]="id()"
      [disabled]="isDisabled()"
      [value]="value()"
      (input)="onInput($any($event.target))"
      (focus)="focused.set(true)"
      (blur)="focused.set(false); onTouched()"
      (select)="$any($event.target).setSelectionRange(value().length, value().length)"
    />
  `,
})
export class IvInputOtp implements ControlValueAccessor {
  readonly maxLength = input.required({ transform: numberAttribute })
  /** Regex source every typed or pasted value must match, e.g. `REGEXP_ONLY_DIGITS`. */
  readonly pattern = input<string | null>(null)
  readonly disabled = input(false)
  readonly valueInput = input('', { alias: 'value' })
  readonly id = input<string | null>(null)
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' })
  readonly class = input('')

  readonly valueChange = output<string>()
  /** Fires once every slot is filled. */
  readonly complete = output<string>()

  protected readonly digits = REGEXP_ONLY_DIGITS
  readonly value = linkedSignal(() => this.valueInput() ?? '')
  readonly focused = signal(false)
  private readonly formDisabled = signal(false)
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled())
  /** Slot that shows the caret: the next empty one, or the last. */
  readonly activeIndex = computed(() =>
    this.focused() ? Math.min(this.value().length, this.maxLength() - 1) : -1
  )

  protected readonly classes = computed(() =>
    cn('cn-input-otp relative flex w-fit items-center has-disabled:opacity-50', this.class())
  )

  private onChange = (_: string) => {}
  onTouched = () => {}

  protected onInput(el: HTMLInputElement) {
    const next = el.value.slice(0, this.maxLength())
    const pattern = this.pattern()
    if (next && pattern && !new RegExp(pattern).test(next)) {
      // Reject the keystroke or paste: keep the last good value.
      el.value = this.value()
      return
    }
    this.value.set(next)
    this.onChange(next)
    this.valueChange.emit(next)
    if (next.length === this.maxLength()) this.complete.emit(next)
  }

  writeValue(value: string | null) { this.value.set(value ?? '') }
  registerOnChange(fn: (_: string) => void) { this.onChange = fn }
  registerOnTouched(fn: () => void) { this.onTouched = fn }
  setDisabledState(isDisabled: boolean) { this.formDisabled.set(isDisabled) }
}

@Component({
  selector: 'iv-input-otp-group',
  host: { 'data-slot': 'input-otp-group', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvInputOtpGroup {
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-input-otp-group flex items-center', this.class()))
}

@Component({
  selector: 'iv-input-otp-slot',
  host: {
    'data-slot': 'input-otp-slot',
    'aria-hidden': 'true',
    '[attr.data-active]': 'active()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    {{ char() }}
    @if (active() && !char()) {
      <div class="cn-input-otp-caret pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="cn-input-otp-caret-line"></div>
      </div>
    }
  `,
})
export class IvInputOtpSlot {
  private readonly otp = inject(IvInputOtp)
  readonly index = input.required({ transform: numberAttribute })
  readonly class = input('')

  protected readonly char = computed(() => this.otp.value()[this.index()] ?? '')
  protected readonly active = computed(() => this.otp.activeIndex() === this.index())
  protected readonly classes = computed(() =>
    cn('cn-input-otp-slot relative flex items-center justify-center data-[active=true]:z-10', this.class())
  )
}

@Component({
  selector: 'iv-input-otp-separator',
  imports: [LucideMinus],
  host: { 'role': 'separator', 'data-slot': 'input-otp-separator', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg lucideMinus aria-hidden="true"></svg>`,
})
export class IvInputOtpSeparator {
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-input-otp-separator flex items-center', this.class()))
}

export const IV_INPUT_OTP_IMPORTS = [IvInputOtp, IvInputOtpGroup, IvInputOtpSlot, IvInputOtpSeparator] as const

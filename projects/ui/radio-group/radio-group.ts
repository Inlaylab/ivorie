import {
  Component,
  forwardRef,
  inject,
  ChangeDetectionStrategy,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  Injector,
  input,
  linkedSignal,
  output,
  OnInit,
  signal,
  viewChild,
} from '@angular/core'
import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { cn } from '@inlaylab/ivorie/core'

@Component({
  selector: 'iv-radio-group',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IvRadioGroup),
      multi: true,
    },
  ],
  host: {
    'data-slot': 'radio-group',
    'role': 'radiogroup',
    '[class]': 'classes()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-disabled]': '_disabled() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvRadioGroup implements ControlValueAccessor {
  readonly value = input<string | null>(null)
  readonly disabled = input(false)
  readonly orientation = input<'horizontal' | 'vertical' | undefined>(undefined)
  readonly class = input('');

  readonly valueChange = output<string | null>();

  // Local state: selection and the form write here; a new input value resets it.
  readonly _value = linkedSignal(this.value)
  // Two sources, so a later [disabled] change cannot re-enable a form-disabled control.
  private readonly _formDisabled = signal(false)
  readonly _disabled = computed(() => this.disabled() || this._formDisabled())

  private readonly items = contentChildren(forwardRef(() => IvRadioGroupItem), { descendants: true })
  private readonly keys = new FocusKeyManager(this.items, inject(Injector))
    .withWrap()

  // Roving tabindex: the checked item, else the first enabled one.
  readonly _tabStop = computed(() => {
    const enabled = this.items().filter((i) => i.ready() && !i.isDisabled())
    return enabled.find((i) => i.value() === this._value()) ?? enabled[0]
  })

  protected readonly classes = computed(() => cn('cn-radio-group w-full', this.class()))

  private _onChange = (_: string | null) => {}
  _onTouched = () => {}

  constructor() {
    inject(DestroyRef).onDestroy(() => this.keys.destroy())
  }

  select(value: string) {
    if (this._disabled() || value === this._value()) return
    this._value.set(value)
    this._onChange(value)
    this.valueChange.emit(value)
  }

  // WAI-ARIA radio: every arrow key moves focus and selects; disabled items are skipped, ends wrap.
  _onKeydown(event: KeyboardEvent, item: IvRadioGroupItem) {
    const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[event.key]
    if (!step) return
    event.preventDefault()
    this.keys.updateActiveItem(item)
    if (step > 0) this.keys.setNextItemActive()
    else this.keys.setPreviousItemActive()
    const next = this.keys.activeItem
    if (next && next !== item) this.select(next.value())
  }

  writeValue(val: string | null) { this._value.set(val) }
  registerOnChange(fn: (_: string | null) => void) { this._onChange = fn }
  registerOnTouched(fn: () => void) { this._onTouched = fn }
  setDisabledState(isDisabled: boolean) { this._formDisabled.set(isDisabled) }
}

// Each item is a native <button> (like Radix), so <label for> and focus work without extra code.
@Component({
  selector: 'iv-radio-group-item',
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
      #button
      type="button"
      role="radio"
      data-slot="radio-group-item"
      [attr.id]="id()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [attr.aria-checked]="checked()"
      [attr.data-state]="checked() ? 'checked' : 'unchecked'"
      [attr.data-checked]="checked() ? '' : null"
      [attr.data-unchecked]="checked() ? null : ''"
      [attr.data-disabled]="isDisabled() ? '' : null"
      [attr.value]="value()"
      [attr.tabindex]="group._tabStop() === this ? 0 : -1"
      [disabled]="isDisabled()"
      [class]="classes()"
      (click)="group.select(value())"
      (keydown)="group._onKeydown($event, this)"
      (keydown.enter)="$event.preventDefault()"
      (blur)="group._onTouched()"
    >
      @if (checked()) {
        <span data-slot="radio-group-indicator" class="cn-radio-group-indicator">
          <span class="cn-radio-group-indicator-icon"></span>
        </span>
      }
    </button>
  `,
})
export class IvRadioGroupItem implements FocusableOption, OnInit {
  protected readonly group = inject(IvRadioGroup)
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button')

  readonly value = input.required<string>();
  // Aliased: FocusableOption needs `disabled` to be a boolean (the key manager skips disabled items).
  readonly disabledInput = input(false, { alias: 'disabled' })
  readonly id = input<string | null>(null)
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' })
  readonly class = input('');

  // Set once inputs are bound: the group must not read `value` of an item rendered later in the same pass.
  readonly ready = signal(false)
  readonly checked = computed(() => this.group._value() === this.value())
  readonly isDisabled = computed(() => this.disabledInput() || this.group._disabled())
  get disabled() { return this.isDisabled() }

  ngOnInit(): void { this.ready.set(true) }

  protected readonly classes = computed(() =>
    cn(
      'cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50',
      this.class(),
    )
  )

  focus() { this.button().nativeElement.focus() }
}

export const IV_RADIO_GROUP_IMPORTS = [
  IvRadioGroup,
  IvRadioGroupItem,
] as const

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
} from '@angular/core'
import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { cn } from '@inlaylab/ivorie/core'
import { ToggleVariants, toggleVariants } from '@inlaylab/ivorie/toggle'

export type ToggleGroupType = 'single' | 'multiple'
/** `single`: the pressed value or null. `multiple`: the pressed values. */
export type ToggleGroupValue = string | string[] | null

@Component({
  selector: 'iv-toggle-group',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IvToggleGroup), multi: true }],
  host: {
    'role': 'group',
    'data-slot': 'toggle-group',
    '[attr.data-variant]': 'variant() ?? "default"',
    '[attr.data-size]': 'size() ?? "default"',
    '[attr.data-spacing]': 'spacing()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[style.--gap]': 'spacing()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvToggleGroup implements ControlValueAccessor {
  readonly type = input<ToggleGroupType>('single')
  readonly value = input<ToggleGroupValue>(null)
  readonly disabled = input(false)
  readonly variant = input<ToggleVariants['variant']>('default')
  readonly size = input<ToggleVariants['size']>('default')
  readonly spacing = input(2, { transform: numberAttribute })
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal')
  readonly class = input('')

  readonly valueChange = output<ToggleGroupValue>()

  // Local state: clicks and the form write here; a new input value resets it.
  private readonly _value = linkedSignal(this.value)
  private readonly formDisabled = signal(false)
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled())

  private readonly items = contentChildren(forwardRef(() => IvToggleGroupItem), { descendants: true })
  private readonly keys = new FocusKeyManager(this.items, inject(Injector)).withWrap().withHomeAndEnd()

  /** Roving tabindex: the first pressed item, else the first enabled one. */
  readonly tabStop = computed(() => {
    const enabled = this.items().filter((i) => !i.isDisabled())
    return enabled.find((i) => this.isPressed(i.value())) ?? enabled[0]
  })

  protected readonly classes = computed(() =>
    cn(
      'cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch',
      this.class()
    )
  )

  private onChange = (_: ToggleGroupValue) => {}
  onTouched = () => {}

  constructor() {
    inject(DestroyRef).onDestroy(() => this.keys.destroy())
  }

  isPressed(value: string): boolean {
    const v = this._value()
    return Array.isArray(v) ? v.includes(value) : v === value
  }

  toggle(value: string) {
    if (this.isDisabled()) return
    let next: ToggleGroupValue
    if (this.type() === 'multiple') {
      const list = Array.isArray(this._value()) ? (this._value() as string[]) : []
      next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    } else {
      next = this._value() === value ? null : value
    }
    this._value.set(next)
    this.onChange(next)
    this.valueChange.emit(next)
  }

  // Arrows move focus only; Space / Enter press (native button click).
  onKeydown(event: KeyboardEvent, item: IvToggleGroupItem) {
    const vertical = this.orientation() === 'vertical'
    const steps: Record<string, number> = vertical ? { ArrowDown: 1, ArrowUp: -1 } : { ArrowRight: 1, ArrowLeft: -1 }
    const step = steps[event.key]
    this.keys.updateActiveItem(item)
    if (step) {
      event.preventDefault()
      if (step > 0) this.keys.setNextItemActive()
      else this.keys.setPreviousItemActive()
    } else if (event.key === 'Home' || event.key === 'End') {
      this.keys.onKeydown(event)
    }
  }

  writeValue(value: ToggleGroupValue) { this._value.set(value) }
  registerOnChange(fn: (_: ToggleGroupValue) => void) { this.onChange = fn }
  registerOnTouched(fn: () => void) { this.onTouched = fn }
  setDisabledState(isDisabled: boolean) { this.formDisabled.set(isDisabled) }
}

@Directive({
  selector: 'button[ivToggleGroupItem]',
  host: {
    'type': 'button',
    'data-slot': 'toggle-group-item',
    '[attr.role]': 'group.type() === "single" ? "radio" : null',
    '[attr.aria-checked]': 'group.type() === "single" ? pressed() : null',
    '[attr.aria-pressed]': 'group.type() === "multiple" ? pressed() : null',
    '[attr.data-state]': 'pressed() ? "on" : "off"',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-spacing]': 'group.spacing()',
    '[attr.tabindex]': 'group.tabStop() === this ? 0 : -1',
    '[disabled]': 'isDisabled()',
    '[class]': 'classes()',
    '(click)': 'group.toggle(value())',
    '(keydown)': 'group.onKeydown($event, this)',
    '(blur)': 'group.onTouched()',
  },
})
export class IvToggleGroupItem implements FocusableOption {
  protected readonly group = inject(IvToggleGroup)
  private readonly host: ElementRef<HTMLButtonElement> = inject(ElementRef)

  readonly value = input.required<string>()
  // Aliased: FocusableOption needs `disabled` to be a boolean (the key manager skips disabled items).
  readonly disabledInput = input(false, { alias: 'disabled' })
  readonly class = input('')

  readonly isDisabled = computed(() => this.disabledInput() || this.group.isDisabled())
  get disabled() { return this.isDisabled() }
  protected readonly pressed = computed(() => this.group.isPressed(this.value()))
  protected readonly variant = computed(() => this.group.variant() ?? 'default')
  protected readonly size = computed(() => this.group.size() ?? 'default')

  protected readonly classes = computed(() =>
    cn(
      'cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t',
      toggleVariants({ variant: this.variant(), size: this.size() }),
      this.class()
    )
  )

  focus() { this.host.nativeElement.focus() }
}

export const IV_TOGGLE_GROUP_IMPORTS = [IvToggleGroup, IvToggleGroupItem] as const

import { ActiveDescendantKeyManager, Highlightable } from '@angular/cdk/a11y'
import { ConnectedOverlayPositionChange, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay'
import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterEveryRender,
  afterNextRender,
  computed,
  contentChildren,
  forwardRef,
  inject,
  signal,
  ChangeDetectionStrategy,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { LucideCheck, LucideChevronDown } from '@lucide/angular'
import { IvTruncateTooltip } from '@inlaylab/ivorie/tooltip'
import { IvIdGenerator, cn, connectedPositions } from '@inlaylab/ivorie/core'

// ─── Root ────────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-select',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IvSelect),
      multi: true,
    },
  ],
  host: {
    'data-slot': 'select',
    '[class]': 'classes()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-state]': 'isOpen() ? "open" : "closed"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSelect implements ControlValueAccessor {
  readonly value = input<string | null>(null)

  readonly placeholder = input('Select an option');
  readonly disabled = input(false)
  readonly size = input<'default' | 'sm'>('default');
  readonly class = input('');

  readonly valueChange = output<string | null>();

  // Local state: selection and the form write here; a new input value resets it.
  readonly _value = linkedSignal(this.value)
  // Two sources, so a later [disabled] change cannot re-enable a form-disabled control.
  private readonly _formDisabled = signal(false)
  readonly isDisabled = computed(() => this.disabled() || this._formDisabled())
  readonly isOpen = signal(false)

  readonly listboxId = inject(IvIdGenerator).next('iv-select-listbox')
  readonly triggerRef = signal<ElementRef<HTMLElement> | null>(null)
  readonly triggerWidth = signal<number | null>(null)

  readonly items = contentChildren(forwardRef(() => IvSelectItem), { descendants: true })
  readonly keyManager = new ActiveDescendantKeyManager(this.items, inject(Injector))
    .withTypeAhead()
    .withHomeAndEnd()
  readonly activeId = signal<string | null>(null)

  /** Label of the selected item, '' when nothing matches. */
  readonly displayValue = computed(() => {
    const value = this._value()
    return this.items().find((item) => item.value() === value)?.getLabel() ?? ''
  })

  protected readonly classes = computed(() => cn('block min-w-0', this.class()))

  private _onChange = (_: string | null) => {}
  private _onTouched = () => {}

  constructor() {
    this.keyManager.change.subscribe(() => this.activeId.set(this.keyManager.activeItem?.id ?? null))
    // destroy() completes `change`/`tabOut` and tears down the effect the key manager keeps on the
    // items signal; without it, that effect keeps running after this component is gone.
    inject(DestroyRef).onDestroy(() => this.keyManager.destroy())
  }

  setTrigger(ref: ElementRef<HTMLElement>) {
    this.triggerRef.set(ref)
  }

  open() {
    if (this.isDisabled()) return
    this.triggerWidth.set(this.triggerRef()?.nativeElement.offsetWidth ?? null)
    this.isOpen.set(true)
    const selected = this.items().find((item) => item.value() === this._value() && !item.disabled)
    if (selected) this.keyManager.setActiveItem(selected)
    else this.keyManager.setFirstItemActive()
  }

  /** Closes the list and marks the control touched. Focus goes back to the trigger unless `refocus` is false (Tab). */
  close(refocus = true) {
    if (!this.isOpen()) return
    this.isOpen.set(false)
    this.keyManager.updateActiveItem(-1)
    this.activeId.set(null)
    this._onTouched()
    if (refocus) this.triggerRef()?.nativeElement.focus()
  }

  toggle() {
    this.isOpen() ? this.close() : this.open()
  }

  select(value: string) {
    this._value.set(value)
    this._onChange(value)
    this.valueChange.emit(value)
    this.close()
  }

  /** Trigger keys, like Radix: Enter/Space/arrows open; while open the key manager moves the active option. */
  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        this.open()
      }
      return
    }
    if (event.key === 'Escape') {
      // Handled, so an enclosing dialog stays open.
      event.preventDefault()
      this.close()
    } else if (event.key === 'Tab') {
      this.close(false)
    } else if (event.key === 'Enter' || (event.key === ' ' && !this.keyManager.isTyping())) {
      event.preventDefault()
      const active = this.keyManager.activeItem
      if (active && !active.disabled) this.select(active.value())
    } else {
      this.keyManager.onKeydown(event)
    }
  }

  writeValue(val: string | null) { this._value.set(val) }
  registerOnChange(fn: (_: string | null) => void) { this._onChange = fn }
  registerOnTouched(fn: () => void) { this._onTouched = fn }
  setDisabledState(isDisabled: boolean) { this._formDisabled.set(isDisabled) }
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

// The trigger is a native <button> (like Radix), so <label for> and focus work without extra code.
@Component({
  selector: 'iv-select-trigger',
  imports: [LucideChevronDown, IvTruncateTooltip],
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
      role="combobox"
      data-slot="select-trigger"
      [attr.id]="id()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [attr.data-size]="size() ?? parent.size()"
      [attr.data-state]="parent.isOpen() ? 'open' : 'closed'"
      [attr.data-placeholder]="!parent.displayValue() ? '' : null"
      [attr.data-active]="active() ? '' : null"
      [attr.aria-expanded]="parent.isOpen()"
      [attr.aria-controls]="parent.isOpen() ? parent.listboxId : null"
      [attr.aria-activedescendant]="parent.isOpen() ? parent.activeId() : null"
      [disabled]="parent.isDisabled()"
      [class]="classes()"
      (click)="parent.toggle()"
      (keydown)="parent.onKeydown($event)"
    >
      <span
        data-slot="select-value"
        class="min-w-0 gap-1.5"
        [ivTruncateTooltip]="text()"
        [ivTruncateTooltipMeasure]="valueText"
      >
        @if (label()) {
          <span class="shrink-0 text-muted-foreground">{{ label() }}:</span>
        }
        <span
          #valueText
          data-slot="select-value-text"
          class="min-w-0 truncate"
          [class.font-medium]="active()"
          [class.text-foreground]="active()"
          >{{ text() }}</span
        >
      </span>
      <svg lucideChevronDown class="cn-select-trigger-icon pointer-events-none" aria-hidden="true"></svg>
    </button>
  `,
})
export class IvSelectTrigger {
  readonly parent = inject(IvSelect)
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button')

  readonly id = input<string | null>(null)
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' })
  /** Overrides the root `size`. */
  readonly size = input<'default' | 'sm' | undefined>(undefined)
  readonly class = input('');
  /** Optional static prefix shown before the selected value, e.g. `Feature: All` */
  readonly label = input('')
  /** Value meaning "no filter" (e.g. `''`, `'*'`, `'ALL'`). Any other value marks a labelled trigger as active. */
  readonly resetValue = input('');

  protected readonly active = computed(() => {
    const v = this.parent._value()
    return !!this.label() && v != null && v !== this.resetValue()
  })

  protected readonly text = computed(() => this.parent.displayValue() || this.parent.placeholder())

  protected readonly classes = computed(() =>
    cn(
      'cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0 ' +
      'data-active:border-primary/40 data-active:bg-primary/5',
      this.class(),
    )
  )

  constructor() {
    // The overlay anchors to the button; the host is display: contents and has no box.
    afterNextRender(() => this.parent.setTrigger(this.button()))
  }
}

// ─── Content (CDK overlay panel) ─────────────────────────────────────────────

@Component({
  selector: 'iv-select-content',
  imports: [OverlayModule],
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (parent.triggerRef(); as origin) {
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="parent.isOpen()"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        [cdkConnectedOverlayMinWidth]="parent.triggerWidth() ?? 0"
        (backdropClick)="parent.close()"
        (detach)="parent.close()"
        (positionChange)="onPosition($event)"
      >
        <div
          data-slot="select-content"
          data-align-trigger="false"
          [attr.data-state]="parent.isOpen() ? 'open' : 'closed'"
          [attr.data-side]="side()"
          [class]="classes()"
        >
          <div role="listbox" data-position="popper" class="cn-select-viewport" [id]="parent.listboxId">
            <ng-content />
          </div>
        </div>
      </ng-template>
    }
  `,
})
export class IvSelectContent {
  readonly parent = inject(IvSelect)

  readonly class = input('');

  readonly positions: ConnectedPosition[] = connectedPositions('bottom', 'start', 4)
  protected readonly side = signal<'top' | 'bottom'>('bottom')

  // w-full fills the .cdk-overlay-pane, which cdkConnectedOverlayMinWidth sizes to the trigger.
  protected readonly classes = computed(() =>
    cn(
      'cn-select-content cn-menu-target cn-menu-translucent relative z-50 max-h-72 w-full origin-top overflow-x-hidden overflow-y-auto overscroll-contain data-[align-trigger=true]:animate-none',
      this.class(),
    )
  )

  protected onPosition(change: ConnectedOverlayPositionChange) {
    this.side.set(change.connectionPair.overlayY === 'bottom' ? 'top' : 'bottom')
  }
}

// ─── Group ───────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-select-group',
  host: { 'data-slot': 'select-group', 'role': 'group', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSelectGroup {
  readonly class = input('');
  protected readonly classes = computed(() => cn('cn-select-group', this.class()))
}

// ─── Label ───────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-select-label',
  host: { 'data-slot': 'select-label', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSelectLabel {
  readonly class = input('');
  protected readonly classes = computed(() => cn('cn-select-label', this.class()))
}

// ─── Item ────────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-select-item',
  imports: [LucideCheck],
  host: {
    'data-slot': 'select-item',
    'role': 'option',
    '[id]': 'id',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': 'disabled ? "true" : null',
    '[attr.data-disabled]': 'disabled ? "" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    '[class]': 'classes()',
    '(click)': 'onSelect()',
    '(mouseenter)': 'parent.keyManager.setActiveItem(this)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cn-select-item-indicator">
      @if (isSelected()) {
        <svg lucideCheck class="cn-select-item-indicator-icon pointer-events-none" aria-hidden="true"></svg>
      }
    </span>
    <span #text><ng-content /></span>
  `,
})
export class IvSelectItem implements Highlightable {
  protected readonly parent = inject(IvSelect)
  private readonly el: HTMLElement = inject(ElementRef).nativeElement
  private readonly text = viewChild.required<ElementRef<HTMLElement>>('text')

  readonly id = inject(IvIdGenerator).next('iv-select-item')
  readonly value = input.required<string>();
  // Aliased: the key manager reads a plain `disabled` boolean.
  readonly disabledInput = input(false, { alias: 'disabled' });
  readonly class = input('');

  get disabled(): boolean { return this.disabledInput() }

  protected readonly highlighted = signal(false)
  protected readonly isSelected = computed(() => this.parent._value() === this.value())

  // Focus stays on the trigger (aria-activedescendant), so data-highlighted marks the active option.
  protected readonly classes = computed(() =>
    cn(
      'cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 ' +
      'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
      this.class(),
    )
  )

  // Read after every render, not lazily inside the parent's computed(): a plain textContent read
  // is invisible to Angular's reactivity, so the trigger's displayValue would miss a label that
  // changes without the selection or item list itself changing.
  private readonly label = signal('')

  constructor() {
    // afterRenderEffect only reruns when a signal it reads changes; a plain textContent read has
    // no signal to track. afterEveryRender fires on every application render regardless.
    afterEveryRender(() => this.label.set(this.text().nativeElement.textContent?.trim() ?? ''))
  }

  setActiveStyles() {
    this.highlighted.set(true)
    this.el.scrollIntoView?.({ block: 'nearest' })
  }
  setInactiveStyles() { this.highlighted.set(false) }
  getLabel(): string { return this.label() }

  protected onSelect() {
    if (this.disabled) return
    this.parent.select(this.value())
  }
}

// ─── Separator ───────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-select-separator',
  host: {
    'data-slot': 'select-separator',
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvSelectSeparator {
  readonly class = input('');
  protected readonly classes = computed(() => cn('cn-select-separator pointer-events-none', this.class()))
}

// ─── Barrel ──────────────────────────────────────────────────────────────────

export const IV_SELECT_IMPORTS = [
  IvSelect,
  IvSelectTrigger,
  IvSelectContent,
  IvSelectGroup,
  IvSelectLabel,
  IvSelectItem,
  IvSelectSeparator,
] as const

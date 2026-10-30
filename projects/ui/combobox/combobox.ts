import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  OnInit,
  signal,
  untracked,
  viewChild
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular'
import { ActiveDescendantKeyManager, Highlightable } from '@angular/cdk/a11y'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'
import { Subscription } from 'rxjs'
import { IvTruncateTooltip } from '@inlaylab/ivorie/tooltip'
import { IvButton } from '@inlaylab/ivorie/button'
import { IvInputGroupAddon, IvInputGroupButton, IvInputGroupInput } from '@inlaylab/ivorie/input'
import { IvIdGenerator, cn, connectedPositions } from '@inlaylab/ivorie/core'

// ─── Root ────────────────────────────────────────────────────────────────────

/**
 * IvCombobox — root context provider.
 *
 * Single:
 *   <iv-combobox [(ngModel)]="val">
 *     <iv-combobox-input aria-label="Fruit" />
 *     <iv-combobox-content>
 *       <iv-combobox-list>
 *         <iv-combobox-item value="a" label="Apple">Apple</iv-combobox-item>
 *       </iv-combobox-list>
 *     </iv-combobox-content>
 *   </iv-combobox>
 *
 * Multi:
 *   <iv-combobox [multiple]="true" [(ngModel)]="vals">
 *     <iv-combobox-chips aria-label="Fruits">
 *       @for (v of vals; track v) {
 *         <iv-combobox-chip [value]="v" [label]="labelFor(v)" />
 *       }
 *     </iv-combobox-chips>
 *     <iv-combobox-content> ... </iv-combobox-content>
 *   </iv-combobox>
 */
@Component({
  selector: 'iv-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IvCombobox),
      multi: true,
    },
  ],
  host: {
    'data-slot': 'combobox',
    'class': 'relative block',
    '[attr.data-state]': 'isOpen() ? "open" : "closed"',
    '[attr.data-multiple]': 'multiple() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
  },
  template: `<ng-content />`,
})
export class IvCombobox implements ControlValueAccessor {
  readonly value = input<string | string[] | null>(null)

  readonly placeholder = input('Select…');
  readonly disabled = input(false)
  readonly multiple = input(false);

  readonly valueChange = output<string | string[] | null>();
  readonly searchChange = output<string>();
  readonly searchSubmit = output<string>();

  // Local state: selection and the form write here; a new input value resets it.
  readonly _value = linkedSignal(this.value)
  // Two sources, so a later [disabled] change cannot re-enable a form-disabled control.
  private readonly _formDisabled = signal(false)
  readonly isDisabled = computed(() => this.disabled() || this._formDisabled())
  readonly searchValue = signal('')
  readonly isOpen = signal(false)
  readonly listboxId = inject(IvIdGenerator).next('iv-combobox-listbox')

  // Items exist even while the panel is closed (projected content is created eagerly).
  readonly items = contentChildren(IvComboboxItem, { descendants: true })
  readonly visibleItemCount = computed(() => this.items().filter((i) => i.isVisible()).length)
  readonly shouldShowEmpty = computed(() => this.visibleItemCount() === 0)
  private readonly _navItems = computed(() => this.items().filter((i) => i.isVisible() && !i.isDisabled()))
  readonly keyManager = new ActiveDescendantKeyManager(this._navItems, inject(Injector)).withWrap()
  // A hidden item is not active, even if the key manager still points at it.
  readonly activeItem = computed(() => this._navItems().find((i) => i.active()) ?? null)

  private _onChange = (_: string | string[] | null) => { }
  private _onTouched = () => { }

  constructor() {
    // Labels can arrive after writeValue: show the selected item's label once it is known.
    effect(() => {
      const value = this._value()
      if (this.multiple() || typeof value !== 'string' || !value) return
      // While open the search belongs to the user (it may be cleared on purpose); close() restores the label.
      if (untracked(this.isOpen)) return
      const label = this.labelFor(value)
      const search = untracked(this.searchValue)
      if (!search || search === value) this.searchValue.set(label)
    })
    // destroy() tears down the effect the key manager keeps on the items signal; without it, that
    // effect keeps running after this component is gone.
    inject(DestroyRef).onDestroy(() => this.keyManager.destroy())
  }

  writeValue(val: string | string[] | null): void {
    this._value.set(val)
    if (!this.multiple()) this.searchValue.set(typeof val === 'string' ? this.labelFor(val) : '')
  }
  registerOnChange(fn: (_: string | string[] | null) => void): void { this._onChange = fn }
  registerOnTouched(fn: () => void): void { this._onTouched = fn }
  setDisabledState(isDisabled: boolean): void { this._formDisabled.set(isDisabled) }

  open(): void {
    if (this.isDisabled() || this.isOpen()) return
    this.isOpen.set(true)
  }

  close(): void {
    if (!this.isOpen()) return
    this.isOpen.set(false)
    this.keyManager.setActiveItem(-1)
    this._onTouched()
    if (!this.multiple()) {
      const value = this._value()
      const next = typeof value === 'string' ? this.labelFor(value) : ''
      if (this.searchValue() !== next) this.setSearch(next)
    }
  }

  toggle(): void { this.isOpen() ? this.close() : this.open() }

  /** ESC closes an open list only; marked handled so an enclosing dialog stays open. */
  onEscape(event: Event): void {
    if (!this.isOpen()) return
    event.preventDefault()
    this.close()
  }

  /** Text input keys: arrows open and move, Enter (open only) selects or submits, Escape and Tab close. */
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        this.open()
        if (this.isOpen()) this.keyManager.onKeydown(event)
        break
      case 'Enter': {
        event.preventDefault()
        if (!this.isOpen()) break
        const item = this.activeItem()
        item ? this.select(item.value()) : this.submitSearch()
        break
      }
      case 'Escape':
        this.onEscape(event)
        break
      case 'Tab':
        this.close()
        break
    }
  }

  setSearch(val: string): void {
    this.searchValue.set(val)
    this.keyManager.setActiveItem(-1)
    this.searchChange.emit(val)
  }

  clearSearch(): void { this.setSearch('') }

  submitSearch(): void {
    const trimmed = this.searchValue().trim()
    // The shown selection is not a search.
    if (!trimmed || (!this.multiple() && trimmed === this.labelFor(this._value() as string | null))) return
    this.searchSubmit.emit(trimmed)
    this.setSearch('')
  }

  isSelected(value: string): boolean {
    const current = this._value()
    return this.multiple()
      ? Array.isArray(current) && current.includes(value)
      : current === value
  }

  select(value: string): void {
    if (this.multiple()) {
      const current = this._value()
      const arr = Array.isArray(current) ? [...current] : []
      const idx = arr.indexOf(value)
      idx === -1 ? arr.push(value) : arr.splice(idx, 1)
      this._emit(arr)
    } else {
      this._emit(value)
      this.setSearch(this.labelFor(value))
      this.close()
    }
  }

  removeValue(value: string): void {
    const current = this._value()
    if (!this.multiple() || !Array.isArray(current)) return
    this._emit(current.filter(v => v !== value))
  }

  private _emit(next: string | string[] | null): void {
    this._value.set(next)
    this._onChange(next)
    this.valueChange.emit(next)
  }

  labelFor(value: string | null | undefined): string {
    if (value == null) return ''
    const item = this.items().find((i) => i.ready() && i.value() === value)
    return item?.label() || value
  }
}

// ─── Input ────────────────────────────────────────────────────────────────────

/** Search input in an input group, with optional trigger and clear buttons (radix base `ComboboxInput`). */
@Component({
  selector: 'iv-combobox-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideX, LucideChevronDown, IvTruncateTooltip, IvInputGroupInput, IvInputGroupAddon, IvInputGroupButton],
  host: {
    'data-slot': 'input-group',
    'role': 'group',
    '[class]': 'classes()',
    '[attr.data-state]': 'parent.isOpen() ? "open" : "closed"',
    '[attr.data-active]': 'active() ? "" : null',
    '[attr.data-disabled]': 'parent.isDisabled() ? "true" : null',
    // id and aria-label move to the input.
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
  },
  template: `
    @if (label()) {
      <iv-input-group-addon align="inline-start">{{ label() }}:</iv-input-group-addon>
    }
    <input
      #searchInput
      ivInputGroupInput
      type="text"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      [attr.id]="id()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-expanded]="parent.isOpen()"
      [attr.aria-controls]="parent.isOpen() ? (listboxId() ?? parent.listboxId) : null"
      [attr.aria-activedescendant]="parent.isOpen() ? (parent.activeItem()?.id ?? null) : null"
      [placeholder]="placeholder() ?? parent.placeholder()"
      [disabled]="parent.isDisabled()"
      [value]="parent.searchValue()"
      (input)="onSearch($any($event.target).value)"
      [ivTruncateTooltip]="parent.isOpen() ? '' : parent.searchValue()"
      (focus)="parent.open()"
      (keydown)="parent.onKeydown($event)"
      [class.font-medium]="active()"
    />
    <iv-input-group-addon align="inline-end">
      @if (showTrigger()) {
        <iv-input-group-button
          data-slot="combobox-trigger"
          size="icon-xs"
          variant="ghost"
          class="cn-combobox-trigger group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
          [disabled]="parent.isDisabled()"
          [aria-label]="parent.isOpen() ? 'Close' : 'Open'"
          (click)="parent.toggle()"
        >
          <svg lucideChevronDown class="cn-combobox-trigger-icon pointer-events-none" aria-hidden="true"></svg>
        </iv-input-group-button>
      }
      @if (showClear() && parent.searchValue()) {
        <iv-input-group-button
          data-slot="combobox-clear"
          size="icon-xs"
          variant="ghost"
          class="cn-combobox-clear"
          [disabled]="parent.isDisabled()"
          aria-label="Clear search"
          (click)="parent.clearSearch(); searchInput.focus()"
        >
          <svg lucideX class="cn-combobox-clear-icon pointer-events-none" aria-hidden="true"></svg>
        </iv-input-group-button>
      }
    </iv-input-group-addon>
  `,
})
export class IvComboboxInput {
  readonly parent = inject(IvCombobox)

  readonly showTrigger = input(true);
  readonly showClear = input(false);
  readonly placeholder = input<string>();
  /** Defaults to the list's generated id. */
  readonly listboxId = input<string>();
  readonly id = input<string | null>(null)
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly class = input('');
  /** Optional static prefix shown before the input, e.g. `User: All` */
  readonly label = input('')

  protected readonly active = computed(() => {
    const value = this.parent._value()
    return !!this.label() && typeof value === 'string' && value !== ''
  })

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly classes = computed(() =>
    cn(
      'group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto',
      'cn-combobox-input w-auto',
      'data-[active]:border-primary/40 data-[active]:bg-primary/5',
      this.class(),
    )
  )

  focus(): void { this.searchInput()?.nativeElement.focus() }

  onSearch(val: string): void {
    this.parent.setSearch(val)
    this.parent.open()
  }
}

// ─── Content (CDK Overlay) ────────────────────────────────────────────────────

/**
 * IvComboboxContent
 *
 * Floating panel via CDK Overlay. An effect opens and closes the overlay with
 * `parent.isOpen()`; no overlay exists before the first open.
 * The panel is as wide as the anchor (`--anchor-width`, radix base sizing);
 * the list caps its own height and scrolls.
 *
 * @input align  'start' | 'end'  (default: 'start')
 */
@Component({
  selector: 'iv-combobox-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'block' },
  template: `
    <ng-template #panelTpl>
      <div data-slot="combobox-content"
           data-open=""
           [attr.data-chips]="parent.multiple()"
           [attr.data-empty]="parent.shouldShowEmpty() ? '' : null"
           [style]="vars()"
           [class]="classes()"
           (keydown.escape)="parent.onEscape($event)">
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class IvComboboxContent implements OnDestroy {
  readonly parent = inject(IvCombobox)
  private overlay = inject(Overlay)
  private vcr = inject(ViewContainerRef)
  private el = inject(ElementRef)
  private doc = inject(DOCUMENT)

  readonly align = input<'start' | 'end'>('start');
  readonly side = input<'auto' | 'bottom'>('auto');
  readonly class = input('');

  readonly panelTpl = viewChild.required<TemplateRef<void>>('panelTpl');

  protected readonly vars = signal<Record<string, string>>({})
  private _overlayRef?: OverlayRef
  private _subs = new Subscription()

  protected readonly classes = computed(() =>
    cn(
      'cn-combobox-content cn-combobox-content-logical cn-menu-target cn-menu-translucent group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width)',
      this.class(),
    )
  )

  constructor() {
    effect(() => {
      const open = this.parent.isOpen()
      untracked(() => (open ? this._openPanel() : this._closePanel()))
    })
    // Items hide and show as the user types. Re-anchor so a panel above the input keeps its edge.
    effect(() => {
      this.parent.visibleItemCount()
      untracked(() => this._overlayRef?.updatePosition())
    })
  }

  private _openPanel(): void {
    if (this._overlayRef) return
    // Anchor = the host element (sits right below the input, same width).
    const anchor = this.el.nativeElement as HTMLElement
    const rect = anchor.getBoundingClientRect()
    const view = this.doc.defaultView
    // shortcut: space is measured once on open, not on scroll or resize; track it if panels clip.
    this.vars.set({
      '--anchor-width': `${rect.width}px`,
      '--available-height': `${Math.max(rect.top, (view?.innerHeight ?? 0) - rect.bottom) - 12}px`,
      '--available-width': `${(view?.innerWidth ?? 0) - 16}px`,
    })

    const [below, above] = connectedPositions('bottom', 'start', 6)
    const [belowEnd, aboveEnd] = connectedPositions('bottom', 'end', 6)

    const positions = this.side() === 'bottom'
      ? (this.align() === 'end' ? [belowEnd] : [below])
      : (this.align() === 'end' ? [belowEnd, aboveEnd] : [below, above])

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions(positions)
      .withPush(false)
      .withViewportMargin(8)

    this._overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition({ autoClose: true }),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    })

    this._subs.add(
      this._overlayRef.backdropClick().subscribe(() => this.parent.close())
    )

    this._overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr))
  }

  private _closePanel(): void {
    this._subs.unsubscribe()
    this._subs = new Subscription()
    this._overlayRef?.dispose()
    this._overlayRef = undefined
  }

  ngOnDestroy(): void { this._closePanel() }
}

// ─── List ─────────────────────────────────────────────────────────────────────

/** Scrollable listbox inside the panel. It caps its own height and scrolls. */
@Component({
  selector: 'iv-combobox-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-slot': 'combobox-list',
    'role': 'listbox',
    '[id]': 'id() ?? parent.listboxId',
    '[attr.aria-multiselectable]': 'parent.multiple() || null',
    '[attr.data-empty]': 'parent.shouldShowEmpty() ? "" : null',
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class IvComboboxList {
  protected readonly parent = inject(IvCombobox)
  /** Defaults to a generated id. */
  readonly id = input<string>();
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-combobox-list block overflow-y-auto overscroll-contain', this.class())
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-combobox-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCheck],
  host: {
    'data-slot': 'combobox-item',
    'role': 'option',
    '[id]': 'id',
    '[attr.data-value]': 'value()',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.data-selected]': 'isSelected() ? "" : null',
    '[attr.data-highlighted]': 'active() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[hidden]': '!isVisible()',
    '[class]': 'classes()',
    '(click)': 'onSelect()',
    '(mouseenter)': 'onHover()',
    // Keep focus on the input.
    '(mousedown)': '$event.preventDefault()',
  },
  template: `
    <ng-content />
    @if (isSelected()) {
      <span class="cn-combobox-item-indicator" aria-hidden="true">
        <svg lucideCheck class="cn-combobox-item-indicator-icon pointer-events-none"></svg>
      </span>
    }
  `,
})
export class IvComboboxItem implements Highlightable, OnInit {
  private parent = inject(IvCombobox)
  private el: ElementRef<HTMLElement> = inject(ElementRef)

  readonly value = input.required<string>();
  readonly label = input('');
  // Not a `disabled` field: the key manager expects that to be a boolean.
  readonly isDisabled = input(false, { alias: 'disabled' });
  readonly class = input('');

  readonly id = inject(IvIdGenerator).next('iv-combobox-item')
  readonly active = signal(false)
  // Set once inputs are bound: the parent must not read `value` of an item rendered later in the same pass.
  readonly ready = signal(false)
  readonly isSelected = computed(() => this.parent.isSelected(this.value()))
  readonly isVisible = computed(() => {
    const s = this.parent.searchValue().trim().toLowerCase()
    return !s || this.label().toLowerCase().includes(s)
  })

  protected readonly classes = computed(() =>
    cn(
      'cn-combobox-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      this.class(),
    )
  )

  setActiveStyles(): void {
    this.active.set(true)
    this.el.nativeElement.scrollIntoView?.({ block: 'nearest' })
  }
  setInactiveStyles(): void { this.active.set(false) }

  ngOnInit(): void { this.ready.set(true) }

  onHover(): void {
    if (!this.isDisabled()) this.parent.keyManager.setActiveItem(this)
  }

  onSelect(): void {
    if (this.isDisabled()) return
    this.parent.select(this.value())
  }
}

// ─── Group / Label / Separator ────────────────────────────────────────────────

@Component({
  selector: 'iv-combobox-group',
  host: { 'data-slot': 'combobox-group', 'role': 'group', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvComboboxGroup {
  readonly class = input('');
  protected readonly classes = computed(() => cn('cn-combobox-group block', this.class()))
}

@Component({
  selector: 'iv-combobox-label',
  host: { 'data-slot': 'combobox-label', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvComboboxLabel {
  readonly class = input('');
  protected readonly classes = computed(() => cn('cn-combobox-label block', this.class()))
}

@Component({
  selector: 'iv-combobox-separator',
  host: {
    'data-slot': 'combobox-separator',
    'role': 'separator',
    'aria-orientation': 'horizontal',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvComboboxSeparator {
  readonly class = input('');
  protected readonly classes = computed(() => cn('cn-combobox-separator block', this.class()))
}

// ─── Empty state ──────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-combobox-empty',
  host: {
    'data-slot': 'combobox-empty',
    '[class]': 'classes()',
    '[hidden]': '!parent.shouldShowEmpty()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvComboboxEmpty {
  readonly parent = inject(IvCombobox)
  readonly class = input('');
  protected readonly classes = computed(() => cn('cn-combobox-empty', this.class()))
}

// ─── Chips ────────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-combobox-chips',
  host: {
    'data-slot': 'combobox-chips',
    '[class]': 'classes()',
    // id and aria-label move to the input.
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <input type="text" autocomplete="off" role="combobox"
      data-slot="combobox-chip-input"
      aria-autocomplete="list"
      [attr.id]="id()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-expanded]="parent.isOpen()"
      [attr.aria-controls]="parent.isOpen() ? parent.listboxId : null"
      [attr.aria-activedescendant]="parent.isOpen() ? (parent.activeItem()?.id ?? null) : null"
      [placeholder]="hasSelectedValues() ? '' : parent.placeholder()"
      [disabled]="parent.isDisabled()"
      [value]="parent.searchValue()"
      (input)="onSearch($any($event.target).value)"
      (focus)="parent.open()"
      (keydown)="parent.onKeydown($event)"
      (keydown.backspace)="onBackspace()"
      class="cn-combobox-chip-input min-w-16 flex-1 outline-none"
    />
  `,
})
export class IvComboboxChips {
  readonly parent = inject(IvCombobox)
  readonly id = input<string | null>(null)
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-combobox-chips', this.class()))

  protected readonly hasSelectedValues = computed(() => {
    const value = this.parent._value()
    return Array.isArray(value) && value.length > 0
  })

  onSearch(val: string): void {
    this.parent.setSearch(val)
    this.parent.open()
  }

  onBackspace(): void {
    if (this.parent.searchValue()) return
    const value = this.parent._value()
    const vals = Array.isArray(value) ? value : []
    if (vals.length) this.parent.removeValue(vals[vals.length - 1])
  }
}

@Component({
  selector: 'iv-combobox-chip',
  imports: [LucideX, IvButton],
  host: { 'data-slot': 'combobox-chip', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="truncate max-w-32">{{ label() }}</span>
    <button ivButton variant="ghost" size="icon-xs" tabindex="-1"
      [attr.data-slot]="'combobox-chip-remove'"
      class="cn-combobox-chip-remove"
      [disabled]="parent.isDisabled()"
      [attr.aria-label]="'Remove ' + label()"
      (click)="$event.stopPropagation(); parent.removeValue(value())">
      <svg lucideX class="cn-combobox-chip-indicator-icon pointer-events-none" aria-hidden="true"></svg>
    </button>
  `,
})
export class IvComboboxChip {
  readonly parent = inject(IvCombobox)

  readonly value = input.required<string>();
  readonly label = input('');
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'cn-combobox-chip has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50',
      this.class(),
    )
  )
}

// ─── Barrel ──────────────────────────────────────────────────────────────────

export const IV_COMBOBOX_IMPORTS = [
  IvCombobox,
  IvComboboxInput,
  IvComboboxContent,
  IvComboboxList,
  IvComboboxItem,
  IvComboboxGroup,
  IvComboboxLabel,
  IvComboboxSeparator,
  IvComboboxEmpty,
  IvComboboxChips,
  IvComboboxChip,
] as const

export type IvComboboxValue = string | string[] | null

import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y'
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay'
import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  Injectable,
  InjectionToken,
  Injector,
  OnInit,
  Signal,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
  WritableSignal,
  input,
  linkedSignal,
  model,
  output,
  untracked,
  viewChild
} from '@angular/core'
import { LucideCheck, LucideChevronRight } from '@lucide/angular'
import { Subject } from 'rxjs'
import { cn, connectedPositions } from '@ivorie/ui/core'

/** Where focus goes when a menu opens: first / last item (keyboard), the menu itself (click), or
 *  nowhere (hover — the trigger keeps focus; only an explicit action should move it). */
type OpenFocus = 'first' | 'last' | 'menu' | 'none'

@Injectable()
export class IvDropdownMenuStore {
  /** The menu this sub menu belongs to; null for the root menu. */
  readonly parent = inject(IvDropdownMenuStore, { optional: true, skipSelf: true })
  readonly isOpen = signal(false)
  readonly triggerRef = signal<ElementRef<HTMLElement> | null>(null)
  openFocus: OpenFocus = 'menu'
  /** Set by the menu content: true while a typeahead search is in progress. */
  isTyping: () => boolean = () => false
  /** The child sub menu currently open, if any (set on open, cleared on close). */
  private readonly openSub = signal<IvDropdownMenuStore | null>(null)

  constructor() {
    // A sub menu closes with its parent.
    const parent = this.parent
    if (parent) effect(() => { if (!parent.isOpen()) untracked(() => this.isOpen.set(false)) })
  }

  open(focus: OpenFocus = 'menu') {
    this.openFocus = focus
    this.isOpen.set(true)
    if (this.parent) {
      const prevSibling = this.parent.openSub()
      if (prevSibling && prevSibling !== this) prevSibling.close()
      this.parent.openSub.set(this)
    }
  }

  close() {
    this.isOpen.set(false)
    if (this.parent?.openSub() === this) this.parent.openSub.set(null)
  }

  /** Closes this menu's currently open sub menu, if any (hovering a sibling item). */
  closeOpenSub() {
    this.openSub()?.close()
  }

  toggle() {
    if (this.isOpen()) this.close()
    else this.open()
  }

  setTrigger(ref: ElementRef<HTMLElement>) {
    this.triggerRef.set(ref)
  }

  /** Closes this menu and returns focus to its trigger. */
  closeAndFocus() {
    this.close()
    this.triggerRef()?.nativeElement.focus()
  }

  /** Closes the whole menu tree (item picked) and focuses the root trigger. */
  closeAll() {
    let root: IvDropdownMenuStore = this
    while (root.parent) root = root.parent
    root.closeAndFocus()
  }
}

/** An item the menu's key manager moves through. */
interface MenuItem {
  /** The menu whose list holds this item. */
  readonly menu: IvDropdownMenuStore
  readonly disabled: Signal<boolean>
  readonly host: ElementRef<HTMLElement>
  focus(): void
  getLabel(): string
}

const IV_MENU_ITEM = new InjectionToken<MenuItem>('IV_MENU_ITEM')

@Directive()
abstract class IvMenuItemBase implements MenuItem {
  readonly host: ElementRef<HTMLElement> = inject(ElementRef)
  protected store = inject(IvDropdownMenuStore)
  readonly menu = this.store
  abstract readonly disabled: Signal<boolean>
  abstract onClick(event: Event): void

  focus() {
    this.host.nativeElement.focus()
  }

  getLabel() {
    return this.host.nativeElement.textContent?.trim() ?? ''
  }

  onEnter() {
    if (this.disabled()) return
    this.focus()
    // Moving to a sibling item closes whatever sub menu the last one opened.
    this.menu.closeOpenSub()
  }

  /** Space selects, like Enter — unless a typeahead search is running, where it's a character instead. */
  onSpace(event: Event) {
    if (this.menu.isTyping()) return
    this.onClick(event)
  }
}

const itemHost = {
  'tabindex': '-1',
  '[class]': 'classes()',
  '[attr.data-disabled]': 'disabled() ? "" : null',
  '[attr.aria-disabled]': 'disabled() || null',
  '(click)': 'onClick($event)',
  '(keydown.enter)': 'onClick($event)',
  '(keydown.space)': 'onSpace($event)',
  '(mouseenter)': 'onEnter()',
}

@Component({
  selector: 'iv-dropdown-menu',
  standalone: true,
  providers: [IvDropdownMenuStore],
  host: { 'data-slot': 'dropdown-menu' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDropdownMenu {}

@Directive({
  selector: '[ivDropdownMenuTrigger]',
  standalone: true,
  host: {
    'data-slot': 'dropdown-menu-trigger',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
    '[attr.aria-haspopup]': '"menu"',
    '[attr.aria-expanded]': 'store.isOpen()',
    '[attr.data-state]': 'store.isOpen() ? "open" : "closed"',
  },
})
export class IvDropdownMenuTrigger implements OnInit {
  private el: ElementRef<HTMLElement> = inject(ElementRef)
  store = inject(IvDropdownMenuStore)

  ngOnInit() {
    this.store.setTrigger(this.el)
  }

  onClick(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.store.toggle()
  }

  onKeydown(event: KeyboardEvent) {
    const focus = ({ Enter: 'first', ' ': 'first', ArrowDown: 'first', ArrowUp: 'last' } as const)[
      event.key as 'Enter'
    ]
    if (!focus) return
    // Also stops the native click that Enter / Space would fire.
    event.preventDefault()
    this.store.open(focus)
  }
}

/** Shared by the root and sub menu content: key manager, open focus, keyboard. */
@Directive()
abstract class IvMenuContentBase {
  readonly store = inject(IvDropdownMenuStore)
  private injector = inject(Injector)
  private allItems = contentChildren(IV_MENU_ITEM, { descendants: true })
  // The skip predicate below replaces the key manager's own `disabled` check (ours is a signal).
  private items = computed(() => this.allItems().filter((i) => i.menu === this.store)) as Signal<
    (MenuItem & FocusableOption)[]
  >
  private keyManager = new FocusKeyManager(this.items, this.injector)
    .withWrap()
    .withHomeAndEnd()
    .withTypeAhead()
    .skipPredicate((i) => i.disabled())
  protected readonly menuEl = viewChild<ElementRef<HTMLElement>>('menu')
  readonly originRef = this.store.triggerRef

  constructor() {
    this.store.isTyping = () => this.keyManager.isTyping()
  }

  onAttach() {
    afterNextRender(
      () => {
        const focus = this.store.openFocus
        if (focus === 'first') this.keyManager.setFirstItemActive()
        else if (focus === 'last') this.keyManager.setLastItemActive()
        else if (focus === 'menu') this.menuEl()?.nativeElement.focus()
        // 'none': hover-opened — leave focus on the trigger, don't steal it.
      },
      { injector: this.injector },
    )
  }

  /** Keeps the key manager in step when focus moves by pointer. */
  onFocusin(event: FocusEvent) {
    const item = this.items().find((i) => i.host.nativeElement === event.target)
    if (item) this.keyManager.updateActiveItem(item)
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || (event.key === 'ArrowLeft' && this.store.parent)) {
      event.preventDefault()
      event.stopPropagation()
      this.store.closeAndFocus()
    } else if (event.key === 'Tab') {
      event.preventDefault()
      this.store.closeAll()
    } else {
      this.keyManager.onKeydown(event)
    }
  }
}

@Component({
  selector: 'iv-dropdown-menu-content',
  standalone: true,
  imports: [OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (originRef()) {
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="originRef()!"
        [cdkConnectedOverlayOpen]="store.isOpen()"
        [cdkConnectedOverlayPositions]="positions()"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        [cdkConnectedOverlayPanelClass]="['iv-dropdown-menu-panel']"
        (backdropClick)="store.close()"
        (detach)="store.close()"
        (attach)="onAttach()"
      >
        <div
          #menu
          role="menu"
          tabindex="-1"
          data-slot="dropdown-menu-content"
          data-state="open"
          [class]="classes()"
          [attr.data-side]="side()"
          (keydown)="onKeydown($event)"
          (focusin)="onFocusin($event)"
        >
          <ng-content />
        </div>
      </ng-template>
    }
  `,
})
export class IvDropdownMenuContent extends IvMenuContentBase {
  readonly align = input<'start' | 'center' | 'end'>('start');
  readonly side = input<'top' | 'bottom' | 'left' | 'right'>('bottom');
  readonly sideOffset = input(4);
  readonly alignOffset = input(0);
  readonly class = input('');

  readonly positions = computed(() =>
    connectedPositions(this.side(), this.align(), this.sideOffset(), this.alignOffset()),
  )
  readonly classes = computed(() =>
    cn(
      'cn-dropdown-menu-content cn-menu-target cn-menu-translucent z-50 max-h-[var(--cdk-overlay-available-height,80vh)] overflow-x-hidden overflow-y-auto outline-hidden',
      this.class(),
    ),
  )
}

@Component({
  selector: 'iv-dropdown-menu-group',
  standalone: true,
  host: { 'role': 'group', 'data-slot': 'dropdown-menu-group' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDropdownMenuGroup {}

@Component({
  selector: 'iv-dropdown-menu-label',
  standalone: true,
  host: {
    'data-slot': 'dropdown-menu-label',
    '[class]': 'classes()',
    '[attr.data-inset]': 'inset() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDropdownMenuLabel {
  readonly inset = input(false);
  readonly class = input('');

  readonly classes = computed(() => cn('cn-dropdown-menu-label block', this.class()))
}

@Component({
  selector: 'iv-dropdown-menu-item',
  standalone: true,
  providers: [{ provide: IV_MENU_ITEM, useExisting: IvDropdownMenuItem }],
  host: {
    ...itemHost,
    'role': 'menuitem',
    'data-slot': 'dropdown-menu-item',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[attr.data-variant]': 'variant()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDropdownMenuItem extends IvMenuItemBase {
  readonly inset = input(false);
  readonly disabled = input(false);
  readonly variant = input<'default' | 'destructive'>('default');
  readonly closeOnSelect = input(true);
  readonly class = input('');

  readonly select = output<MouseEvent | KeyboardEvent>();

  readonly classes = computed(() =>
    cn(
      'cn-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      this.class(),
    ),
  )

  onClick(event: Event) {
    // Keyboard only: a mouse click must still follow a link inside the item.
    if (event instanceof KeyboardEvent) event.preventDefault()
    if (this.disabled()) return
    this.select.emit(event as MouseEvent | KeyboardEvent)
    if (this.closeOnSelect()) this.store.closeAll()
  }
}

const checkItemClasses =
  'relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

@Component({
  selector: 'iv-dropdown-menu-checkbox-item',
  standalone: true,
  imports: [LucideCheck],
  providers: [{ provide: IV_MENU_ITEM, useExisting: IvDropdownMenuCheckboxItem }],
  host: {
    ...itemHost,
    'role': 'menuitemcheckbox',
    'data-slot': 'dropdown-menu-checkbox-item',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cn-dropdown-menu-item-indicator pointer-events-none" data-slot="dropdown-menu-checkbox-item-indicator">
      @if (checked()) {
        <svg lucideCheck></svg>
      }
    </span>
    <ng-content />
  `,
})
export class IvDropdownMenuCheckboxItem extends IvMenuItemBase {
  readonly checked = model(false)
  readonly disabled = input(false);
  readonly inset = input(false);
  readonly closeOnSelect = input(false);
  readonly class = input('');

  readonly classes = computed(() => cn('cn-dropdown-menu-checkbox-item', checkItemClasses, this.class()))

  onClick(event: Event) {
    event.preventDefault()
    if (this.disabled()) return
    this.checked.update((v) => !v)
    if (this.closeOnSelect()) this.store.closeAll()
  }
}

@Injectable()
export class IvDropdownMenuRadioGroupStore {
  // The radio group replaces this with a signal linked to its [value] input.
  value: WritableSignal<string | null> = signal(null)
  readonly change = new Subject<string>()

  set(value: string) {
    this.value.set(value)
    this.change.next(value)
  }
}

@Component({
  selector: 'iv-dropdown-menu-radio-group',
  standalone: true,
  providers: [IvDropdownMenuRadioGroupStore],
  host: { 'role': 'group', 'data-slot': 'dropdown-menu-radio-group' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDropdownMenuRadioGroup {
  private group = inject(IvDropdownMenuRadioGroupStore)

  readonly value = input<string | null>(null)
  readonly valueChange = output<string>();

  constructor() {
    this.group.value = linkedSignal(this.value)
    this.group.change.subscribe((v) => this.valueChange.emit(v))
  }
}

@Component({
  selector: 'iv-dropdown-menu-radio-item',
  standalone: true,
  imports: [LucideCheck],
  providers: [{ provide: IV_MENU_ITEM, useExisting: IvDropdownMenuRadioItem }],
  host: {
    ...itemHost,
    'role': 'menuitemradio',
    'data-slot': 'dropdown-menu-radio-item',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[attr.aria-checked]': 'isChecked()',
    '[attr.data-state]': 'isChecked() ? "checked" : "unchecked"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cn-dropdown-menu-item-indicator pointer-events-none" data-slot="dropdown-menu-radio-item-indicator">
      @if (isChecked()) {
        <svg lucideCheck></svg>
      }
    </span>
    <ng-content />
  `,
})
export class IvDropdownMenuRadioItem extends IvMenuItemBase {
  private group = inject(IvDropdownMenuRadioGroupStore)

  readonly value = input.required<string>();
  readonly disabled = input(false);
  readonly inset = input(false);
  readonly closeOnSelect = input(true);
  readonly class = input('');

  readonly isChecked = computed(() => this.group.value() === this.value())
  readonly classes = computed(() => cn('cn-dropdown-menu-radio-item', checkItemClasses, this.class()))

  onClick(event: Event) {
    event.preventDefault()
    if (this.disabled()) return
    this.group.set(this.value())
    if (this.closeOnSelect()) this.store.closeAll()
  }
}

@Component({
  selector: 'iv-dropdown-menu-separator',
  standalone: true,
  host: { 'role': 'separator', 'data-slot': 'dropdown-menu-separator', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvDropdownMenuSeparator {
  readonly class = input('');
  readonly classes = computed(() => cn('cn-dropdown-menu-separator block', this.class()))
}

@Component({
  selector: 'iv-dropdown-menu-shortcut',
  standalone: true,
  host: { 'data-slot': 'dropdown-menu-shortcut', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDropdownMenuShortcut {
  readonly class = input('');
  readonly classes = computed(() => cn('cn-dropdown-menu-shortcut', this.class()))
}

/* ----------------------------- Submenu ---------------------------------- */

@Component({
  selector: 'iv-dropdown-menu-sub',
  standalone: true,
  providers: [IvDropdownMenuStore],
  host: { 'data-slot': 'dropdown-menu-sub' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDropdownMenuSub {}

@Component({
  selector: 'iv-dropdown-menu-sub-trigger',
  standalone: true,
  imports: [LucideChevronRight],
  providers: [{ provide: IV_MENU_ITEM, useExisting: IvDropdownMenuSubTrigger }],
  host: {
    ...itemHost,
    'role': 'menuitem',
    'aria-haspopup': 'menu',
    'data-slot': 'dropdown-menu-sub-trigger',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[attr.aria-expanded]': 'store.isOpen()',
    '[attr.data-state]': 'store.isOpen() ? "open" : "closed"',
    '(mouseenter)': 'onHover()',
    '(keydown.arrowright)': 'onClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <svg lucideChevronRight class="cn-rtl-flip ml-auto"></svg>
  `,
})
export class IvDropdownMenuSubTrigger extends IvMenuItemBase implements AfterViewInit {
  // The sub-trigger is listed in the parent menu, not in its own sub menu.
  override readonly menu = this.store.parent!

  readonly inset = input(false);
  readonly disabled = input(false);
  readonly class = input('');

  readonly classes = computed(() =>
    cn(
      'cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      this.class(),
    ),
  )

  ngAfterViewInit() {
    this.store.setTrigger(this.host)
  }

  onHover() {
    if (this.disabled()) return
    this.focus()
    this.store.open('none')
  }

  onClick(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    if (this.disabled()) return
    if (event instanceof KeyboardEvent) this.store.open('first')
    else this.store.toggle()
  }
}

@Component({
  selector: 'iv-dropdown-menu-sub-content',
  standalone: true,
  imports: [OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (originRef()) {
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="originRef()!"
        [cdkConnectedOverlayOpen]="store.isOpen()"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayHasBackdrop]="false"
        [cdkConnectedOverlayPanelClass]="['iv-dropdown-menu-panel']"
        (detach)="store.close()"
        (attach)="onAttach()"
      >
        <div
          #menu
          role="menu"
          tabindex="-1"
          data-slot="dropdown-menu-sub-content"
          data-state="open"
          data-side="right"
          [class]="classes()"
          (keydown)="onKeydown($event)"
          (focusin)="onFocusin($event)"
        >
          <ng-content />
        </div>
      </ng-template>
    }
  `,
})
export class IvDropdownMenuSubContent extends IvMenuContentBase {
  readonly class = input('');

  readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 4, offsetY: -4 },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -4, offsetY: -4 },
  ]

  readonly classes = computed(() =>
    cn('cn-dropdown-menu-sub-content cn-menu-target cn-menu-translucent z-50 overflow-hidden outline-hidden', this.class()),
  )
}

export const IV_DROPDOWN_MENU_IMPORTS = [
  IvDropdownMenu,
  IvDropdownMenuTrigger,
  IvDropdownMenuContent,
  IvDropdownMenuGroup,
  IvDropdownMenuLabel,
  IvDropdownMenuItem,
  IvDropdownMenuCheckboxItem,
  IvDropdownMenuRadioGroup,
  IvDropdownMenuRadioItem,
  IvDropdownMenuSeparator,
  IvDropdownMenuShortcut,
  IvDropdownMenuSub,
  IvDropdownMenuSubTrigger,
  IvDropdownMenuSubContent,
] as const

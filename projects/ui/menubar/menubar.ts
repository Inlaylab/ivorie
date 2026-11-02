import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  OnInit,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'
import { IV_DROPDOWN_MENU_IMPORTS, IvDropdownMenuStore } from '@inlaylab/ivorie/dropdown-menu'

/** A row of dropdown menus. Arrows move between triggers; an open menu follows the focus. */
@Component({
  selector: 'iv-menubar',
  host: {
    'role': 'menubar',
    'data-slot': 'menubar',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvMenubar {
  readonly class = input('')

  private readonly triggers = contentChildren(forwardRef(() => IvMenubarTrigger), { descendants: true })
  private readonly keys = new FocusKeyManager(this.triggers, inject(Injector)).withWrap().withHorizontalOrientation('ltr')
  /** Roving tabindex: the last focused trigger, else the first. */
  readonly active = signal<IvMenubarTrigger | null>(null)
  readonly tabStop = computed(() => this.active() ?? this.triggers()[0])

  protected readonly classes = computed(() => cn('cn-menubar flex items-center', this.class()))

  constructor() {
    inject(DestroyRef).onDestroy(() => this.keys.destroy())
  }

  get anyOpen() {
    return this.triggers().some((t) => t.store.isOpen())
  }

  /** Moves focus to the next trigger; if a menu was open, opens the next one. */
  move(from: IvMenubarTrigger, step: 1 | -1) {
    const wasOpen = this.anyOpen
    this.keys.updateActiveItem(from)
    if (step > 0) this.keys.setNextItemActive()
    else this.keys.setPreviousItemActive()
    const next = this.keys.activeItem
    if (!next || next === from) return
    from.store.close()
    if (wasOpen) next.store.open('first')
  }

  /** Opens `trigger`'s menu and closes the others. */
  switchTo(trigger: IvMenubarTrigger) {
    for (const t of this.triggers()) if (t !== trigger) t.store.close()
    this.keys.updateActiveItem(trigger)
    trigger.store.open('none')
  }

  onTriggerKeydown(event: KeyboardEvent, trigger: IvMenubarTrigger) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      this.move(trigger, event.key === 'ArrowRight' ? 1 : -1)
    }
  }
}

@Component({
  selector: 'iv-menubar-menu',
  providers: [IvDropdownMenuStore],
  host: { 'data-slot': 'menubar-menu', 'class': 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvMenubarMenu {}

@Directive({
  selector: 'button[ivMenubarTrigger]',
  host: {
    'type': 'button',
    'role': 'menuitem',
    'aria-haspopup': 'menu',
    'data-slot': 'menubar-trigger',
    '[attr.aria-expanded]': 'store.isOpen()',
    '[attr.data-state]': 'store.isOpen() ? "open" : "closed"',
    '[attr.tabindex]': 'menubar.tabStop() === this ? 0 : -1',
    '[class]': 'classes()',
    '(click)': 'onClick()',
    '(mouseenter)': 'onHover()',
    '(focus)': 'menubar.active.set(this)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class IvMenubarTrigger implements FocusableOption, OnInit {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  readonly store = inject(IvDropdownMenuStore)
  protected readonly menubar = inject(IvMenubar)

  readonly class = input('')
  readonly disabled = false

  protected readonly classes = computed(() =>
    cn('cn-menubar-trigger flex items-center outline-hidden select-none', this.class())
  )

  constructor() {
    this.store.modal = false
    this.store.navigate = (step) => {
      this.menubar.move(this, step)
    }
  }

  ngOnInit() {
    this.store.setTrigger(this.el)
  }

  focus() {
    this.el.nativeElement.focus()
  }

  getLabel() {
    return this.el.nativeElement.textContent?.trim() ?? ''
  }

  protected onClick() {
    if (this.store.isOpen()) this.store.close()
    else this.menubar.switchTo(this)
  }

  // Radix: once a menu is open, hovering another trigger switches to it.
  protected onHover() {
    if (!this.store.isOpen() && this.menubar.anyOpen) this.menubar.switchTo(this)
  }

  protected onKeydown(event: KeyboardEvent) {
    const focus = ({ Enter: 'first', ' ': 'first', ArrowDown: 'first', ArrowUp: 'last' } as const)[event.key as 'Enter']
    if (focus) {
      // Also stops the native click that Enter / Space would fire.
      event.preventDefault()
      this.menubar.switchTo(this)
      this.store.open(focus)
      return
    }
    this.menubar.onTriggerKeydown(event, this)
  }
}

/** The menubar parts plus every dropdown menu part (content, items, groups, sub menus). */
export const IV_MENUBAR_IMPORTS = [IvMenubar, IvMenubarMenu, IvMenubarTrigger, ...IV_DROPDOWN_MENU_IMPORTS] as const

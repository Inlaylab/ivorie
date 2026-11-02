import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay'
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injectable,
  OnDestroy,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core'
import { IvIcon } from '@inlaylab/ivorie/icon'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'

export const navigationMenuTriggerStyle =
  'cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none'

@Injectable()
export class IvNavigationMenuStore implements OnDestroy {
  /** The open item's value, or null. */
  readonly value = signal<string | null>(null)
  /** Order of item values; sets the slide direction between panels. */
  order: () => string[] = () => []
  readonly motion = signal<'from-start' | 'from-end' | null>(null)
  private timer?: ReturnType<typeof setTimeout>

  // Radix defaults: a short delay before hover opens, a shorter grace period before it closes.
  openDelay = 200
  closeDelay = 150

  open(value: string) {
    clearTimeout(this.timer)
    const prev = this.value()
    if (prev === value) return
    const order = this.order()
    this.motion.set(prev === null ? null : order.indexOf(value) > order.indexOf(prev) ? 'from-end' : 'from-start')
    this.value.set(value)
  }

  scheduleOpen(value: string) {
    clearTimeout(this.timer)
    // Moving between triggers while a panel is open switches at once.
    if (this.value() !== null) this.open(value)
    else this.timer = setTimeout(() => this.open(value), this.openDelay)
  }

  scheduleClose() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.value.set(null), this.closeDelay)
  }

  cancelClose() {
    clearTimeout(this.timer)
  }

  close() {
    clearTimeout(this.timer)
    this.value.set(null)
  }

  ngOnDestroy() {
    clearTimeout(this.timer)
  }
}

@Component({
  selector: 'iv-navigation-menu',
  providers: [IvNavigationMenuStore],
  host: {
    'data-slot': 'navigation-menu',
    'data-viewport': 'true',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nav [attr.aria-label]="ariaLabel()" class="contents"><ng-content /></nav>`,
})
export class IvNavigationMenu {
  readonly ariaLabel = input('Main', { alias: 'aria-label' })
  readonly class = input('')

  readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  private readonly store = inject(IvNavigationMenuStore)
  private readonly items = contentChildren(forwardRef(() => IvNavigationMenuItem), { descendants: true })

  protected readonly classes = computed(() =>
    cn('cn-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center', this.class())
  )

  constructor() {
    this.store.order = () => this.items().map((i) => i.key())
  }
}

@Directive({
  selector: 'ul[ivNavigationMenuList]',
  host: { 'data-slot': 'navigation-menu-list', '[class]': 'classes()' },
})
export class IvNavigationMenuList {
  readonly class = input('')
  protected readonly classes = computed(() =>
    cn('cn-navigation-menu-list group flex flex-1 list-none items-center justify-center', this.class())
  )
}

@Directive({
  selector: 'li[ivNavigationMenuItem]',
  host: { 'data-slot': 'navigation-menu-item', '[class]': 'classes()' },
})
export class IvNavigationMenuItem {
  readonly value = input<string | null>(null)
  readonly class = input('')

  readonly contentId = inject(IvIdGenerator).next('iv-navigation-menu-content')
  readonly key = computed(() => this.value() ?? this.contentId)
  readonly trigger = signal<ElementRef<HTMLElement> | null>(null)
  private readonly store = inject(IvNavigationMenuStore)
  readonly isOpen = computed(() => this.store.value() === this.key())

  protected readonly classes = computed(() => cn('cn-navigation-menu-item relative', this.class()))
}

@Component({
  selector: 'button[ivNavigationMenuTrigger]',
  imports: [IvIcon],
  host: {
    'type': 'button',
    'data-slot': 'navigation-menu-trigger',
    '[attr.aria-expanded]': 'item.isOpen()',
    '[attr.aria-controls]': 'item.isOpen() ? item.contentId : null',
    '[attr.data-state]': 'item.isOpen() ? "open" : "closed"',
    '[class]': 'classes()',
    '(mouseenter)': 'store.scheduleOpen(item.key())',
    '(mouseleave)': 'store.scheduleClose()',
    '(click)': 'item.isOpen() ? store.close() : store.open(item.key())',
    '(keydown.arrowdown)': 'onArrowDown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content /><svg ivIcon="chevron-down" class="cn-navigation-menu-trigger-icon" aria-hidden="true"></svg>`,
})
export class IvNavigationMenuTrigger {
  protected readonly item = inject(IvNavigationMenuItem)
  protected readonly store = inject(IvNavigationMenuStore)
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  readonly class = input('')

  protected readonly classes = computed(() => cn(navigationMenuTriggerStyle, this.class()))

  constructor() {
    this.item.trigger.set(this.el)
  }

  protected onArrowDown(event: Event) {
    event.preventDefault()
    this.store.open(this.item.key())
    // The panel renders on the next frame; then focus its first link.
    const doc = this.el.nativeElement.ownerDocument
    setTimeout(() => (doc.getElementById(this.item.contentId)?.querySelector('a, button') as HTMLElement | null)?.focus())
  }
}

/** The panel of one item. It opens in a viewport under the whole menu, sliding in from the side the pointer came from. */
@Component({
  selector: 'iv-navigation-menu-content',
  imports: [OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="root.el"
      [cdkConnectedOverlayOpen]="item.isOpen()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayPanelClass]="['iv-navigation-menu-panel']"
      (overlayOutsideClick)="onOutsideClick($event)"
      (detach)="store.value() === item.key() && store.close()"
    >
      <div
        data-slot="navigation-menu-viewport"
        data-state="open"
        class="cn-navigation-menu-viewport origin-top-left relative mt-1.5 overflow-hidden"
        (mouseenter)="store.cancelClose()"
        (mouseleave)="store.scheduleClose()"
        (keydown.escape)="onEscape()"
      >
        <div
          data-slot="navigation-menu-content"
          data-state="open"
          [id]="item.contentId"
          [attr.data-motion]="store.motion()"
          [class]="classes()"
          (click)="onClick($event)"
        >
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class IvNavigationMenuContent {
  protected readonly root = inject(IvNavigationMenu)
  protected readonly item = inject(IvNavigationMenuItem)
  protected readonly store = inject(IvNavigationMenuStore)
  readonly class = input('')

  protected readonly positions: ConnectedPosition[] = [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]
  protected readonly classes = computed(() =>
    cn(
      'cn-navigation-menu-content block w-full **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:w-auto',
      this.class()
    )
  )

  protected onOutsideClick(event: MouseEvent) {
    if (!this.root.el.nativeElement.contains(event.target as Node)) this.store.close()
  }

  protected onEscape() {
    this.store.close()
    this.item.trigger()?.nativeElement.focus()
  }

  // Following a link closes the menu.
  protected onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('a')) this.store.close()
  }
}

@Directive({
  selector: 'a[ivNavigationMenuLink]',
  host: {
    'data-slot': 'navigation-menu-link',
    '[attr.data-active]': 'active() || null',
    '[attr.aria-current]': 'active() ? "page" : null',
    '[class]': 'classes()',
  },
})
export class IvNavigationMenuLink {
  readonly active = input(false)
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-navigation-menu-link', this.class()))
}

export const IV_NAVIGATION_MENU_IMPORTS = [
  IvNavigationMenu,
  IvNavigationMenuList,
  IvNavigationMenuItem,
  IvNavigationMenuTrigger,
  IvNavigationMenuContent,
  IvNavigationMenuLink,
] as const

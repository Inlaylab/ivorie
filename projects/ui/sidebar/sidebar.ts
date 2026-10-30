import { CdkTrapFocus } from '@angular/cdk/a11y'
import { NgTemplateOutlet } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { LucidePanelLeft } from '@lucide/angular'
import { buttonVariants } from '@ivorie/ui/button'
import { IvIdGenerator, cn } from '@ivorie/ui/core'
import { IV_TOOLTIP_IMPORTS } from '@ivorie/ui/tooltip'
import { IvSidebarService, SIDEBAR_COOKIE_NAME, SidebarCollapsible, SidebarVariant } from './sidebar.service'

// ─── Provider ────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-sidebar-provider',
  standalone: true,
  providers: [IvSidebarService],
  host: {
    'data-slot': 'sidebar-wrapper',
    style: '--sidebar-width: 16rem; --sidebar-width-icon: 3rem',
    '[class]': 'classes()',
    '(document:keydown)': 'onKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarProvider implements OnInit {
  readonly sidebar = inject(IvSidebarService)
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly doc = inject(DOCUMENT)

  readonly defaultOpen = input(true)
  /** Cookie that saves open/closed. Give each sidebar on a page its own name; `''` saves nothing. */
  readonly cookieName = input(SIDEBAR_COOKIE_NAME)
  readonly class = input('')

  readonly classes = computed(() =>
    cn('group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar', this.class()),
  )

  // While the mobile drawer is open: lock body scroll, and make everything else here (e.g. the
  // main[ivSidebarInset] content) inert, so it can't be scrolled, clicked or read by a screen
  // reader behind the modal drawer.
  private readonly locked = computed(() => this.sidebar.isMobile() && this.sidebar.openMobile())
  private prevBodyOverflow = ''
  private inertedSiblings: (HTMLElement & { inert: boolean })[] = []

  constructor() {
    effect(() => {
      const locked = this.locked()
      untracked(() => this.setLocked(locked))
    })
    inject(DestroyRef).onDestroy(() => this.setLocked(false))
  }

  ngOnInit() {
    this.sidebar.init(this.defaultOpen(), this.cookieName())
  }

  private setLocked(locked: boolean) {
    const body = this.doc.body
    if (locked) {
      this.prevBodyOverflow = body.style.overflow
      body.style.overflow = 'hidden'
      const drawer = this.host.nativeElement.querySelector(':scope > [data-slot="sidebar"]')
      this.inertedSiblings = [...this.host.nativeElement.children].filter(
        (el): el is HTMLElement & { inert: boolean } => el !== drawer,
      )
      this.inertedSiblings.forEach((el) => (el.inert = true))
    } else {
      body.style.overflow = this.prevBodyOverflow
      this.inertedSiblings.forEach((el) => (el.inert = false))
      this.inertedSiblings = []
    }
  }

  /** Ctrl+B / Cmd+B toggles the sidebar (shadcn shortcut). */
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      this.sidebar.toggle()
    }
  }
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const floating = (variant: SidebarVariant) => variant === 'floating' || variant === 'inset'

/**
 * Three forms: a fixed panel (`collapsible="none"`), a modal drawer (mobile) and a collapsible
 * panel with a layout gap (desktop). The projected content is rendered once into whichever shows.
 */
@Component({
  selector: 'iv-sidebar',
  standalone: true,
  imports: [NgTemplateOutlet, CdkTrapFocus],
  host: {
    'data-slot': 'sidebar',
    '[id]': 'sidebar.id',
    '[attr.data-state]': 'sidebar.state()',
    '[attr.data-collapsible]': 'sidebar.state() === "collapsed" ? collapsible() : ""',
    '[attr.data-variant]': 'variant()',
    '[attr.data-side]': 'side()',
    '[attr.data-mobile]': 'mobile() ? "true" : null',
    '[class]': 'hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content><ng-content /></ng-template>

    @if (collapsible() === 'none') {
      <ng-container [ngTemplateOutlet]="content" />
    } @else if (mobile()) {
      @if (sidebar.openMobile()) {
        <div
          data-slot="sidebar-overlay"
          class="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
          (click)="sidebar.setOpen(false)"
        ></div>
        <div
          #drawer
          data-sidebar="sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
          tabindex="-1"
          cdkTrapFocus
          cdkTrapFocusAutoCapture
          [attr.data-side]="side()"
          class="fixed inset-y-0 z-50 flex h-full w-(--sidebar-width) flex-col bg-sidebar p-0 outline-none text-sidebar-foreground shadow-lg animate-in duration-200 data-[side=left]:left-0 data-[side=left]:slide-in-from-left data-[side=right]:right-0 data-[side=right]:slide-in-from-right"
          style="--sidebar-width: 18rem"
          (keydown.escape)="sidebar.setOpen(false)"
        >
          <ng-container [ngTemplateOutlet]="content" />
        </div>
      }
    } @else {
      <div data-slot="sidebar-gap" [class]="gapClasses()"></div>
      <div data-slot="sidebar-container" [attr.data-side]="side()" [class]="containerClasses()">
        <div data-sidebar="sidebar" data-slot="sidebar-inner" class="cn-sidebar-inner flex size-full flex-col">
          <ng-container [ngTemplateOutlet]="content" />
        </div>
      </div>
    }
  `,
})
export class IvSidebar {
  readonly sidebar = inject(IvSidebarService)

  readonly side = input<'left' | 'right'>('left')
  readonly variant = input<SidebarVariant>('sidebar')
  readonly collapsible = input<SidebarCollapsible>('offcanvas')
  readonly class = input('')

  protected readonly mobile = computed(() => this.collapsible() !== 'none' && this.sidebar.isMobile())

  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer')
  private readonly trap = viewChild(CdkTrapFocus)

  constructor() {
    // cdkTrapFocusAutoCapture gives up silently when there is nothing tabbable inside, leaving
    // focus wherever it was. Its own focusInitialElementWhenReady() call is idempotent, so calling
    // it again here (we still need cdkTrapFocusAutoCapture itself for its on-destroy focus restore)
    // is harmless and gives us the boolean to fall back on: focus the drawer itself, which has
    // tabindex="-1", so Escape and screen-reader users land inside the modal either way.
    effect(() => {
      const trap = this.trap()
      const drawer = this.drawer()
      if (!trap || !drawer) return
      untracked(async () => {
        const focused = await trap.focusTrap.focusInitialElementWhenReady()
        if (!focused) drawer.nativeElement.focus()
      })
    })
  }

  // The drawer is fixed; `contents` keeps the host out of the flex layout.
  protected readonly hostClasses = computed(() => {
    if (this.collapsible() === 'none') {
      return cn('flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground', this.class())
    }
    return this.mobile() ? 'contents' : 'group peer hidden text-sidebar-foreground md:block'
  })

  protected readonly gapClasses = computed(() =>
    cn(
      'cn-sidebar-gap relative w-(--sidebar-width) bg-transparent',
      'group-data-[collapsible=offcanvas]:w-0',
      'group-data-[side=right]:rotate-180',
      floating(this.variant())
        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
    ),
  )

  protected readonly containerClasses = computed(() =>
    cn(
      'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex',
      floating(this.variant())
        ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
      this.class(),
    ),
  )
}

// ─── Trigger / Rail / Inset ──────────────────────────────────────────────────

@Component({
  selector: 'iv-sidebar-trigger',
  standalone: true,
  imports: [LucidePanelLeft],
  host: { 'data-slot': 'sidebar-trigger', 'data-sidebar': 'trigger' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [class]="classes()"
      [attr.aria-expanded]="sidebar.expanded()"
      [attr.aria-controls]="sidebar.id"
      (click)="sidebar.toggle()"
    >
      <svg lucidePanelLeft class="cn-rtl-flip"></svg>
      <span class="sr-only">Toggle Sidebar</span>
    </button>
  `,
})
export class IvSidebarTrigger {
  readonly sidebar = inject(IvSidebarService)
  readonly class = input('')

  readonly classes = computed(() =>
    cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'cn-sidebar-trigger', this.class()),
  )
}

@Component({
  selector: 'iv-sidebar-rail',
  standalone: true,
  host: { 'data-slot': 'sidebar-rail', 'data-sidebar': 'rail' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      tabindex="-1"
      aria-label="Toggle Sidebar"
      title="Toggle Sidebar"
      class="cn-sidebar-rail absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2 in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full [[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2"
      (click)="sidebar.toggle()"
    ></button>
  `,
})
export class IvSidebarRail {
  readonly sidebar = inject(IvSidebarService)
}

@Component({
  selector: 'main[ivSidebarInset], [ivSidebarInset]',
  standalone: true,
  host: { 'data-slot': 'sidebar-inset', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarInset {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-sidebar-inset relative flex w-full flex-1 flex-col', this.class()))
}

// ─── Layout regions ──────────────────────────────────────────────────────────

@Component({
  selector: 'iv-sidebar-header',
  standalone: true,
  host: { 'data-slot': 'sidebar-header', 'data-sidebar': 'header', class: 'cn-sidebar-header flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarHeader {}

@Component({
  selector: 'iv-sidebar-footer',
  standalone: true,
  host: { 'data-slot': 'sidebar-footer', 'data-sidebar': 'footer', class: 'cn-sidebar-footer flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarFooter {}

@Component({
  selector: 'iv-sidebar-content',
  standalone: true,
  host: {
    'data-slot': 'sidebar-content',
    'data-sidebar': 'content',
    class:
      'cn-sidebar-content flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarContent {}

@Component({
  selector: 'iv-sidebar-separator',
  standalone: true,
  host: {
    'data-slot': 'sidebar-separator',
    'data-sidebar': 'separator',
    role: 'separator',
    class: 'cn-sidebar-separator block h-px w-auto shrink-0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvSidebarSeparator {}

// ─── Groups ──────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-sidebar-group',
  standalone: true,
  host: { 'data-slot': 'sidebar-group', 'data-sidebar': 'group', class: 'cn-sidebar-group relative flex w-full min-w-0 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarGroup {}

@Component({
  selector: 'iv-sidebar-group-label',
  standalone: true,
  host: { 'data-slot': 'sidebar-group-label', 'data-sidebar': 'group-label', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarGroupLabel {
  readonly class = input('')
  readonly classes = computed(() =>
    cn('cn-sidebar-group-label flex shrink-0 items-center outline-hidden [&>svg]:shrink-0', this.class()),
  )
}

@Component({
  selector: 'iv-sidebar-group-action',
  standalone: true,
  host: { 'data-slot': 'sidebar-group-action', 'data-sidebar': 'group-action', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarGroupAction {
  readonly class = input('')
  readonly classes = computed(() =>
    cn(
      'cn-sidebar-group-action flex aspect-square items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0',
      this.class(),
    ),
  )
}

@Component({
  selector: 'iv-sidebar-group-content',
  standalone: true,
  host: { 'data-slot': 'sidebar-group-content', 'data-sidebar': 'group-content', class: 'cn-sidebar-group-content w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarGroupContent {}

// ─── Menu ────────────────────────────────────────────────────────────────────

@Component({
  selector: 'ul[ivSidebarMenu]',
  standalone: true,
  host: { 'data-slot': 'sidebar-menu', 'data-sidebar': 'menu', class: 'cn-sidebar-menu flex w-full min-w-0 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarMenu {}

@Component({
  selector: 'li[ivSidebarMenuItem]',
  standalone: true,
  host: { 'data-slot': 'sidebar-menu-item', 'data-sidebar': 'menu-item', class: 'group/menu-item relative' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarMenuItem {}

export const sidebarMenuButtonVariants = cva(
  'cn-sidebar-menu-button peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate',
  {
    variants: {
      variant: {
        default: 'cn-sidebar-menu-button-variant-default',
        outline: 'cn-sidebar-menu-button-variant-outline',
      },
      size: {
        default: 'cn-sidebar-menu-button-size-default',
        sm: 'cn-sidebar-menu-button-size-sm',
        lg: 'cn-sidebar-menu-button-size-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type SidebarMenuButtonVariants = VariantProps<typeof sidebarMenuButtonVariants>

/**
 * The host is the `peer/menu-button` (menu action and badge are its siblings), so it carries
 * `data-active` / `data-size`; the inner `<button>` carries the look.
 * With `tooltip`, the label shows on hover only while the sidebar is collapsed to icons.
 */
@Component({
  selector: 'iv-sidebar-menu-button',
  standalone: true,
  imports: [IV_TOOLTIP_IMPORTS],
  host: {
    'data-slot': 'sidebar-menu-button',
    'data-sidebar': 'menu-button',
    class: 'peer/menu-button relative block w-full',
    '[attr.data-size]': 'size()',
    '[attr.data-active]': 'isActive() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tooltip class="w-full">
      <button
        ivTooltipTrigger
        type="button"
        [attr.data-size]="size()"
        [attr.data-active]="isActive() ? '' : null"
        [attr.aria-current]="isActive() ? 'page' : null"
        [class]="classes()"
      >
        <ng-content />
      </button>
      <iv-tooltip-content side="right" [hidden]="!showTooltip()">{{ tooltip() }}</iv-tooltip-content>
    </iv-tooltip>
  `,
})
export class IvSidebarMenuButton {
  readonly sidebar = inject(IvSidebarService)

  readonly isActive = input(false)
  readonly variant = input<SidebarMenuButtonVariants['variant']>('default')
  readonly size = input<SidebarMenuButtonVariants['size']>('default')
  readonly tooltip = input('')
  readonly class = input('')

  protected readonly showTooltip = computed(
    () => !!this.tooltip() && this.sidebar.state() === 'collapsed' && !this.sidebar.isMobile(),
  )

  readonly classes = computed(() =>
    cn(sidebarMenuButtonVariants({ variant: this.variant(), size: this.size() }), this.class()),
  )
}

@Component({
  selector: 'iv-sidebar-menu-action',
  standalone: true,
  host: { 'data-slot': 'sidebar-menu-action', 'data-sidebar': 'menu-action', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarMenuAction {
  readonly showOnHover = input(false)
  readonly class = input('')

  readonly classes = computed(() =>
    cn(
      'cn-sidebar-menu-action flex items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0',
      this.showOnHover() &&
        'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0',
      this.class(),
    ),
  )
}

@Component({
  selector: 'iv-sidebar-menu-badge',
  standalone: true,
  host: { 'data-slot': 'sidebar-menu-badge', 'data-sidebar': 'menu-badge', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarMenuBadge {
  readonly class = input('')
  readonly classes = computed(() =>
    cn(
      'cn-sidebar-menu-badge flex items-center justify-center tabular-nums select-none group-data-[collapsible=icon]:hidden',
      this.class(),
    ),
  )
}

const SKELETON_WIDTHS = ['70%', '80%', '60%', '90%']

@Component({
  selector: 'iv-sidebar-menu-skeleton',
  standalone: true,
  host: {
    'data-slot': 'sidebar-menu-skeleton',
    'data-sidebar': 'menu-skeleton',
    class: 'cn-sidebar-menu-skeleton flex items-center',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showIcon()) {
      <div data-sidebar="menu-skeleton-icon" class="cn-sidebar-menu-skeleton-icon animate-pulse bg-sidebar-accent"></div>
    }
    <div
      data-sidebar="menu-skeleton-text"
      class="cn-sidebar-menu-skeleton-text max-w-(--skeleton-width) flex-1 animate-pulse rounded-md bg-sidebar-accent"
      [style.--skeleton-width]="width"
    ></div>
  `,
})
export class IvSidebarMenuSkeleton {
  readonly showIcon = input(false)

  // Not random: server and client count ids the same, so widths match after hydration.
  protected readonly width =
    SKELETON_WIDTHS[Number(inject(IvIdGenerator).next('iv-sidebar-skeleton').split('-').pop()) % SKELETON_WIDTHS.length]
}

// ─── Sub-menu ────────────────────────────────────────────────────────────────

@Component({
  selector: 'ul[ivSidebarMenuSub]',
  standalone: true,
  host: { 'data-slot': 'sidebar-menu-sub', 'data-sidebar': 'menu-sub', class: 'cn-sidebar-menu-sub flex min-w-0 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarMenuSub {}

@Component({
  selector: 'li[ivSidebarMenuSubItem]',
  standalone: true,
  host: { 'data-slot': 'sidebar-menu-sub-item', 'data-sidebar': 'menu-sub-item', class: 'group/menu-sub-item relative' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarMenuSubItem {}

@Component({
  selector: 'a[ivSidebarMenuSubButton]',
  standalone: true,
  host: {
    'data-slot': 'sidebar-menu-sub-button',
    'data-sidebar': 'menu-sub-button',
    '[attr.data-size]': 'size()',
    '[attr.data-active]': 'isActive() ? "" : null',
    '[attr.aria-current]': 'isActive() ? "page" : null',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSidebarMenuSubButton {
  readonly size = input<'sm' | 'md'>('md')
  readonly isActive = input(false)
  readonly class = input('')

  readonly classes = computed(() =>
    cn(
      'cn-sidebar-menu-sub-button flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0',
      this.class(),
    ),
  )
}

// ─── Barrel ──────────────────────────────────────────────────────────────────

export const IV_SIDEBAR_IMPORTS = [
  IvSidebarProvider,
  IvSidebar,
  IvSidebarTrigger,
  IvSidebarRail,
  IvSidebarInset,
  IvSidebarHeader,
  IvSidebarFooter,
  IvSidebarContent,
  IvSidebarSeparator,
  IvSidebarGroup,
  IvSidebarGroupLabel,
  IvSidebarGroupAction,
  IvSidebarGroupContent,
  IvSidebarMenu,
  IvSidebarMenuItem,
  IvSidebarMenuButton,
  IvSidebarMenuAction,
  IvSidebarMenuBadge,
  IvSidebarMenuSkeleton,
  IvSidebarMenuSub,
  IvSidebarMenuSubItem,
  IvSidebarMenuSubButton,
] as const

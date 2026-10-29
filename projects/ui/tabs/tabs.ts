import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y'
import { Directionality } from '@angular/cdk/bidi'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  Signal,
  afterRenderEffect,
  computed,
  contentChildren,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core'
import { cva, VariantProps } from 'class-variance-authority'
import { IvIdGenerator, cn } from '@ivorie/ui/core'

type Orientation = 'horizontal' | 'vertical'

// ─── Root ────────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-tabs',
  standalone: true,
  host: {
    'data-slot': 'tabs',
    '[attr.data-orientation]': 'orientation()',
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusin($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvTabs {
  readonly value = input<string>()
  readonly defaultValue = input('')
  readonly orientation = input<Orientation>('horizontal')
  readonly class = input('')

  readonly valueChange = output<string>()

  readonly classes = computed(() => cn('cn-tabs group/tabs flex data-horizontal:flex-col', this.class()))

  // Selected tab: user activation writes here; a new input value resets it.
  readonly activeTab = linkedSignal(() => this.value() ?? this.defaultValue())

  private readonly baseId = inject(IvIdGenerator).next('iv-tabs')
  private readonly dir = inject(Directionality, { optional: true })

  // `descendants` also finds the triggers of nested tabs; keep only our own.
  // The skip predicate replaces the key manager's own `disabled` check (ours is a signal).
  private readonly allTriggers = contentChildren(IvTabsTrigger, { descendants: true })
  private readonly triggers = computed(() => this.allTriggers().filter((t) => t.tabs === this)) as Signal<
    (IvTabsTrigger & FocusableOption)[]
  >
  private readonly keyManager = new FocusKeyManager(this.triggers, inject(Injector))
    .withWrap()
    .withHomeAndEnd()
    .skipPredicate((t) => t.disabled())

  /**
   * The one tab in the Tab order: the selected one, else the first enabled one.
   * Starts as the selected value, so server HTML already has a tab stop. The fallback is settled
   * after render: every trigger's required `value` is set by then.
   */
  readonly tabbableValue = linkedSignal<string | null>(() => this.activeTab())

  constructor() {
    afterRenderEffect(() => {
      const enabled = this.triggers().filter((t) => !t.disabled())
      const selected = enabled.find((t) => t.value() === this.activeTab())
      this.tabbableValue.set((selected ?? enabled[0])?.value() ?? null)
    })

    // Automatic activation (Radix default): moving focus with the keys selects the tab.
    const sub = this.keyManager.change.subscribe(() => this.keyManager.activeItem?.activate())
    inject(DestroyRef).onDestroy(() => {
      sub.unsubscribe()
      this.keyManager.destroy()
    })
  }

  select(value: string) {
    if (value === this.activeTab()) return
    this.activeTab.set(value)
    this.valueChange.emit(value)
  }

  /** Id helpers, so tabs and panels can point at each other. Values are made id-safe. */
  triggerId(value: string) {
    return `${this.baseId}-trigger-${toIdPart(value)}`
  }

  contentId(value: string) {
    return `${this.baseId}-content-${toIdPart(value)}`
  }

  onKeydown(event: KeyboardEvent) {
    const fromTab = this.triggers().some((t) => t.host.nativeElement === event.target)
    if (!fromTab) return
    const horizontal = this.orientation() === 'horizontal'
    // Re-read each time: orientation and direction can change at runtime.
    this.keyManager
      .withHorizontalOrientation(horizontal ? (this.dir?.value ?? 'ltr') : null)
      .withVerticalOrientation(!horizontal)
      .onKeydown(event)
  }

  /** Keeps the key manager in step when focus moves by pointer or Tab. */
  onFocusin(event: FocusEvent) {
    const trigger = this.triggers().find((t) => t.host.nativeElement === event.target)
    if (trigger) this.keyManager.updateActiveItem(trigger)
  }
}

function toIdPart(value: string) {
  return value.replace(/[^\w-]/g, '_')
}

// ─── List ────────────────────────────────────────────────────────────────────

export const tabsListVariants = cva(
  'cn-tabs-list group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        default: 'cn-tabs-list-variant-default bg-muted',
        line: 'cn-tabs-list-variant-line gap-1 bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type TabsListVariants = VariantProps<typeof tabsListVariants>

@Component({
  selector: 'iv-tabs-list',
  standalone: true,
  host: {
    'data-slot': 'tabs-list',
    role: 'tablist',
    '[attr.aria-orientation]': 'tabs.orientation()',
    '[attr.data-variant]': 'variant()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvTabsList {
  protected readonly tabs = inject(IvTabs)

  readonly variant = input<TabsListVariants['variant']>('default')
  readonly class = input('')

  readonly classes = computed(() => cn(tabsListVariants({ variant: this.variant() }), this.class()))
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-tabs-trigger',
  standalone: true,
  host: {
    'data-slot': 'tabs-trigger',
    role: 'tab',
    '[id]': 'tabs.triggerId(value())',
    '[attr.aria-selected]': 'isActive()',
    '[attr.aria-controls]': 'tabs.contentId(value())',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.data-state]': 'isActive() ? "active" : "inactive"',
    '[attr.data-active]': 'isActive() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.tabindex]': 'tabs.tabbableValue() === value() ? 0 : -1',
    '[class]': 'classes()',
    '(click)': 'activate()',
    '(keydown.enter)': '$event.preventDefault(); activate()',
    '(keydown.space)': '$event.preventDefault(); activate()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvTabsTrigger {
  readonly tabs = inject(IvTabs)
  readonly host: ElementRef<HTMLElement> = inject(ElementRef)

  readonly value = input.required<string>()
  readonly disabled = input(false)
  readonly class = input('')

  readonly isActive = computed(() => this.tabs.activeTab() === this.value())

  // Radix base string; `aria-disabled:` stands in for `disabled:` (the host is not a <button>).
  readonly classes = computed(() =>
    cn(
      'cn-tabs-trigger relative inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center whitespace-nowrap text-foreground/60 transition-all select-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
      'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
      'data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground',
      'group-data-[variant=default]/tabs-list:data-active:shadow-sm',
      'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
      this.class(),
    ),
  )

  activate() {
    if (!this.disabled()) this.tabs.select(this.value())
  }

  focus() {
    this.host.nativeElement.focus()
  }

  getLabel() {
    return this.host.nativeElement.textContent?.trim() ?? ''
  }
}

// ─── Content ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-tabs-content',
  standalone: true,
  host: {
    'data-slot': 'tabs-content',
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'tabs.contentId(value())',
    '[attr.aria-labelledby]': 'tabs.triggerId(value())',
    '[attr.data-state]': 'isActive() ? "active" : "inactive"',
    '[hidden]': '!isActive()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvTabsContent {
  protected readonly tabs = inject(IvTabs)

  readonly value = input.required<string>()
  readonly class = input('')

  readonly isActive = computed(() => this.tabs.activeTab() === this.value())
  readonly classes = computed(() => cn('cn-tabs-content flex-1 outline-none', this.class()))
}

// ─── Barrel ──────────────────────────────────────────────────────────────────

export const IV_TABS_IMPORTS = [IvTabs, IvTabsList, IvTabsTrigger, IvTabsContent] as const

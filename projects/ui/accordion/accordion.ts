import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y'
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Signal,
  computed,
  contentChildren,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
  ElementRef,
} from '@angular/core'
import { LucideChevronDown, LucideChevronUp } from '@lucide/angular'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'

/** Keys the accordion handles between triggers (WAI-ARIA accordion pattern). */
const NAV_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

@Component({
  selector: 'iv-accordion',
  standalone: true,
  host: {
    'data-slot': 'accordion',
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusin($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAccordion {
  readonly type = input<'single' | 'multiple'>('single')
  readonly collapsible = input(true)
  readonly class = input('')
  readonly value = input<string | string[] | null>()

  readonly valueChange = output<string | string[] | null>()

  readonly classes = computed(() => cn('cn-accordion flex w-full flex-col', this.class()))

  // Open items: toggles write here; a new input value resets it.
  private readonly _open = linkedSignal<Set<string>>(() => {
    const v = this.value()
    return new Set(v == null ? [] : Array.isArray(v) ? v : [v])
  })

  // `descendants` also finds the triggers of a nested accordion; keep only our own.
  // The skip predicate replaces the key manager's own `disabled` check (ours is a signal).
  private readonly allTriggers = contentChildren(IvAccordionTrigger, { descendants: true })
  private readonly triggers = computed(() =>
    this.allTriggers().filter((t) => t.item.accordion === this),
  ) as Signal<(IvAccordionTrigger & FocusableOption)[]>
  private readonly keyManager = new FocusKeyManager(this.triggers, inject(Injector))
    .withWrap()
    .withHomeAndEnd()
    .skipPredicate((t) => t.item.disabled())

  isOpen(value: string): boolean {
    return this._open().has(value)
  }

  toggle(value: string): void {
    const next = new Set(this._open())
    if (next.has(value)) {
      if (this.type() === 'single' && !this.collapsible()) return
      next.delete(value)
    } else {
      if (this.type() === 'single') next.clear()
      next.add(value)
    }
    this._open.set(next)
    const open = Array.from(next)
    this.valueChange.emit(this.type() === 'single' ? (open[0] ?? null) : open)
  }

  /** Only from one of our triggers: keys in a field inside a panel stay with the field. */
  onKeydown(event: KeyboardEvent) {
    if (NAV_KEYS.has(event.key) && this.ownTrigger(event.target)) this.keyManager.onKeydown(event)
  }

  /** Keeps the key manager in step when focus moves by pointer or Tab. */
  onFocusin(event: FocusEvent) {
    const trigger = this.ownTrigger(event.target)
    if (trigger) this.keyManager.updateActiveItem(trigger)
  }

  private ownTrigger(target: EventTarget | null) {
    return this.triggers().find((t) => t.button().nativeElement === target)
  }
}

@Component({
  selector: 'iv-accordion-item',
  standalone: true,
  host: {
    'data-slot': 'accordion-item',
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAccordionItem {
  readonly value = input.required<string>()
  readonly class = input('')
  readonly disabled = input(false)

  readonly accordion = inject(IvAccordion)
  private readonly id = inject(IvIdGenerator).next('iv-accordion')
  readonly triggerId = `${this.id}-trigger`
  readonly contentId = `${this.id}-content`

  readonly isOpen = computed(() => this.accordion.isOpen(this.value()))
  readonly state = computed(() => (this.isOpen() ? 'open' : 'closed'))
  readonly classes = computed(() => cn('cn-accordion-item', this.class()))

  toggle(): void {
    if (this.disabled()) return
    this.accordion.toggle(this.value())
  }
}

@Component({
  selector: 'iv-accordion-trigger',
  standalone: true,
  imports: [LucideChevronDown, LucideChevronUp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3 class="flex">
      <button
        #button
        type="button"
        data-slot="accordion-trigger"
        [id]="item.triggerId"
        [attr.aria-expanded]="item.isOpen()"
        [attr.aria-controls]="item.contentId"
        [attr.data-state]="item.state()"
        [disabled]="item.disabled()"
        [class]="classes()"
        (click)="item.toggle()"
      >
        <ng-content />
        <svg
          lucideChevronDown
          data-slot="accordion-trigger-icon"
          class="cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        ></svg>
        <svg
          lucideChevronUp
          data-slot="accordion-trigger-icon"
          class="cn-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        ></svg>
      </button>
    </h3>
  `,
})
export class IvAccordionTrigger implements FocusableOption {
  readonly class = input('')
  readonly item = inject(IvAccordionItem)
  readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button')

  // Focus ring kept on top of the radix base: maia's trigger rule has none.
  readonly classes = computed(() =>
    cn(
      'cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50',
      'rounded-lg focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
      this.class(),
    ),
  )

  focus() {
    this.button().nativeElement.focus()
  }
}

@Component({
  selector: 'iv-accordion-content',
  standalone: true,
  host: {
    'data-slot': 'accordion-content',
    role: 'region',
    class: 'cn-accordion-content block overflow-hidden',
    '[id]': 'item.contentId',
    '[attr.aria-labelledby]': 'item.triggerId',
    '[attr.data-state]': 'item.state()',
    '[hidden]': '!item.isOpen()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class IvAccordionContent {
  readonly class = input('')
  readonly item = inject(IvAccordionItem)

  readonly classes = computed(() =>
    cn(
      'cn-accordion-content-inner [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
      this.class(),
    ),
  )
}

export const IV_ACCORDION_IMPORTS = [
  IvAccordion,
  IvAccordionItem,
  IvAccordionTrigger,
  IvAccordionContent,
] as const

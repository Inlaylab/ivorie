import { ActiveDescendantKeyManager, Highlightable } from '@angular/cdk/a11y'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core'
import { IvIcon } from '@inlaylab/ivorie/icon'

import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'

/** A searchable list of actions. Type to filter; arrows and Enter pick. */
@Component({
  selector: 'iv-command',
  host: {
    'data-slot': 'command',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCommand {
  /** The search text (two-way). */
  readonly search = model('')
  /** False: show every item, e.g. when the app filters on the server. */
  readonly shouldFilter = input(true)
  readonly class = input('')

  readonly listId = inject(IvIdGenerator).next('iv-command-list')
  private readonly items = contentChildren(forwardRef(() => IvCommandItem), { descendants: true })
  /** Items that match the search, in DOM order. */
  readonly visible = computed(() => this.items().filter((i) => i.matches()))
  private readonly keys = new ActiveDescendantKeyManager(this.visible, inject(Injector))
    .withWrap()
    .withHomeAndEnd()
    .skipPredicate((i) => i.isDisabled())
  readonly activeId = signal<string | null>(null)

  protected readonly classes = computed(() => cn('cn-command flex size-full flex-col overflow-hidden', this.class()))

  constructor() {
    this.keys.change.subscribe(() => this.activeId.set(this.keys.activeItem?.id ?? null))
    inject(DestroyRef).onDestroy(() => this.keys.destroy())
    // A new search (or a new item list) highlights the first match.
    effect(() => {
      this.visible()
      untracked(() => {
        this.keys.setFirstItemActive()
        if (!this.keys.activeItem) this.activeId.set(null)
      })
    })
  }

  matches(text: string): boolean {
    const q = this.search().trim().toLowerCase()
    return !this.shouldFilter() || !q || text.toLowerCase().includes(q)
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const item = this.keys.activeItem
      if (item) {
        event.preventDefault()
        item.pick()
      }
      return
    }
    this.keys.onKeydown(event)
  }

  setActive(item: IvCommandItem) {
    if (!item.isDisabled()) this.keys.setActiveItem(item)
  }
}

@Component({
  selector: 'iv-command-input',
  imports: [IvIcon],
  host: { 'data-slot': 'command-input-wrapper', 'class': 'cn-command-input-wrapper block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cn-command-input-group flex items-center">
      <svg ivIcon="search" class="cn-command-input-icon shrink-0" aria-hidden="true"></svg>
      <input
        data-slot="command-input"
        role="combobox"
        type="text"
        autocomplete="off"
        aria-expanded="true"
        aria-autocomplete="list"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-controls]="command.listId"
        [attr.aria-activedescendant]="command.activeId()"
        [attr.placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="command.search()"
        [class]="classes()"
        (input)="command.search.set($any($event.target).value)"
        (keydown)="command.onKeydown($event)"
      />
    </div>
  `,
})
export class IvCommandInput {
  protected readonly command = inject(IvCommand)
  readonly placeholder = input<string | null>(null)
  readonly ariaLabel = input<string | null>('Search', { alias: 'aria-label' })
  readonly disabled = input(false)
  readonly class = input('')

  protected readonly classes = computed(() =>
    cn('cn-command-input w-full outline-hidden disabled:cursor-not-allowed disabled:opacity-50', this.class())
  )
}

@Component({
  selector: 'iv-command-list',
  host: {
    'role': 'listbox',
    'data-slot': 'command-list',
    '[id]': 'command.listId',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCommandList {
  protected readonly command = inject(IvCommand)
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-command-list block overflow-x-hidden overflow-y-auto', this.class()))
}

/** Shown only when no item matches. */
@Component({
  selector: 'iv-command-empty',
  host: {
    'role': 'presentation',
    'data-slot': 'command-empty',
    '[hidden]': 'command.visible().length > 0',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCommandEmpty {
  protected readonly command = inject(IvCommand)
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-command-empty block', this.class()))
}

@Component({
  selector: 'iv-command-group',
  host: {
    'role': 'group',
    'data-slot': 'command-group',
    '[attr.aria-labelledby]': 'heading() ? headingId : null',
    '[hidden]': '!hasVisible()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (heading()) {
      <div cmdk-group-heading [id]="headingId" aria-hidden="true">{{ heading() }}</div>
    }
    <ng-content />
  `,
})
export class IvCommandGroup {
  readonly heading = input<string | null>(null)
  readonly class = input('')
  readonly headingId = inject(IvIdGenerator).next('iv-command-group')
  private readonly items = contentChildren(forwardRef(() => IvCommandItem), { descendants: true })
  // A group with no matching item hides, heading included.
  protected readonly hasVisible = computed(() => this.items().some((i) => i.matches()))
  protected readonly classes = computed(() => cn('cn-command-group block', this.class()))
}

@Component({
  selector: 'iv-command-separator',
  // Not role="separator": a listbox may only own groups and options.
  host: { 'aria-hidden': 'true', 'data-slot': 'command-separator', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class IvCommandSeparator {
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-command-separator block', this.class()))
}

@Component({
  selector: 'iv-command-item',
  imports: [IvIcon],
  host: {
    'role': 'option',
    'data-slot': 'command-item',
    '[id]': 'id',
    '[hidden]': '!matches()',
    '[attr.aria-selected]': 'active()',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.data-selected]': 'active()',
    '[attr.data-disabled]': 'isDisabled()',
    '[attr.data-checked]': 'checked()',
    '[class]': 'classes()',
    '(click)': 'pick()',
    '(mousemove)': 'command.setActive(this)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <svg ivIcon="check" class="cn-command-item-indicator ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" aria-hidden="true"></svg>
  `,
})
export class IvCommandItem implements Highlightable {
  protected readonly command = inject(IvCommand)
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef)

  /** Text the search matches. Default: the item's text. */
  readonly value = input<string | null>(null)
  /** Extra words the search matches. */
  readonly keywords = input<string[]>([])
  readonly disabledInput = input(false, { alias: 'disabled' })
  readonly checked = input(false)
  readonly class = input('')
  readonly select = output<string>()

  readonly id = inject(IvIdGenerator).next('iv-command-item')
  readonly active = signal(false)
  readonly isDisabled = computed(() => this.disabledInput())
  get disabled() { return this.isDisabled() }
  readonly matches = computed(() => this.command.matches([this.text(), ...this.keywords()].join(' ')))

  protected readonly classes = computed(() =>
    cn(
      'cn-command-item group/command-item relative flex cursor-default items-center outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      this.class()
    )
  )

  private text() {
    return this.value() ?? this.host.nativeElement.textContent?.trim() ?? ''
  }

  pick() {
    if (!this.isDisabled()) this.select.emit(this.text())
  }

  setActiveStyles() { this.active.set(true) }
  setInactiveStyles() { this.active.set(false) }
  getLabel() { return this.text() }
}

@Component({
  selector: 'iv-command-shortcut',
  host: { 'data-slot': 'command-shortcut', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCommandShortcut {
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-command-shortcut', this.class()))
}

export const IV_COMMAND_IMPORTS = [
  IvCommand,
  IvCommandInput,
  IvCommandList,
  IvCommandEmpty,
  IvCommandGroup,
  IvCommandSeparator,
  IvCommandItem,
  IvCommandShortcut,
] as const

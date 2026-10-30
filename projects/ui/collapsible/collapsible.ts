import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core'
import { IvIdGenerator } from '@inlaylab/ivorie/core'

@Component({
  selector: 'iv-collapsible',
  standalone: true,
  host: {
    'data-slot': 'collapsible',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[class]': 'class()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCollapsible {
  readonly open = model(false)
  readonly disabled = input(false)
  readonly class = input('')

  /** Shared by the trigger (`aria-controls`) and the content (`id`). */
  readonly contentId = inject(IvIdGenerator).next('iv-collapsible')

  toggle() {
    if (this.disabled()) return
    this.open.update((v) => !v)
  }
}

@Directive({
  selector: '[ivCollapsibleTrigger]',
  standalone: true,
  host: {
    'data-slot': 'collapsible-trigger',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.role]': 'isButton ? null : "button"',
    '[attr.tabindex]': 'isButton ? null : parent.disabled() ? -1 : 0',
    '[attr.disabled]': 'isButton && parent.disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && parent.disabled() ? true : null',
    '[attr.aria-expanded]': 'parent.open()',
    '[attr.aria-controls]': 'parent.contentId',
    '[attr.data-state]': 'parent.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'parent.disabled() ? "" : null',
    '(click)': 'parent.toggle()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
})
export class IvCollapsibleTrigger {
  readonly parent = inject(IvCollapsible)
  /** A native button already turns Enter / Space into a click. */
  protected readonly isButton = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON'

  onKey(event: Event) {
    if (this.isButton) return
    event.preventDefault()
    this.parent.toggle()
  }
}

@Component({
  selector: 'iv-collapsible-content',
  standalone: true,
  host: {
    'data-slot': 'collapsible-content',
    '[id]': 'parent.contentId',
    '[attr.data-state]': 'parent.open() ? "open" : "closed"',
    // Closed content stays in the DOM for the height animation; inert keeps it out of focus and the a11y tree.
    '[attr.inert]': 'parent.open() ? null : ""',
    '[class]': 'class()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid transition-[grid-template-rows] duration-200 ease-in-out"
      [style.grid-template-rows]="parent.open() ? '1fr' : '0fr'"
    >
      <div class="overflow-hidden">
        <ng-content />
      </div>
    </div>
  `,
})
export class IvCollapsibleContent {
  readonly parent = inject(IvCollapsible)
  readonly class = input('')
}

export const IV_COLLAPSIBLE_IMPORTS = [
  IvCollapsible,
  IvCollapsibleTrigger,
  IvCollapsibleContent,
] as const

import { ChangeDetectionStrategy, Component, Directive, ElementRef, inject, input } from '@angular/core'
import { IV_DROPDOWN_MENU_IMPORTS, IvDropdownMenuStore } from '@inlaylab/ivorie/dropdown-menu'

/** A dropdown menu opened at the pointer by a right-click (or the context-menu key) on its trigger area. */
@Component({
  selector: 'iv-context-menu',
  providers: [IvDropdownMenuStore],
  host: { 'data-slot': 'context-menu', 'class': 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvContextMenu {}

@Directive({
  selector: '[ivContextMenuTrigger]',
  host: {
    'data-slot': 'context-menu-trigger',
    '[attr.data-state]': 'store.isOpen() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(contextmenu)': 'onContextMenu($event)',
  },
})
export class IvContextMenuTrigger {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  protected readonly store = inject(IvDropdownMenuStore)

  readonly disabled = input(false)

  protected onContextMenu(event: MouseEvent) {
    if (this.disabled()) return
    event.preventDefault()
    // The keyboard context-menu key reports 0,0: open at the trigger's corner instead.
    const rect = this.el.nativeElement.getBoundingClientRect()
    const fromKey = event.clientX === 0 && event.clientY === 0
    this.store.setTrigger(this.el)
    this.store.point.set(fromKey ? { x: rect.left, y: rect.bottom } : { x: event.clientX, y: event.clientY })
    this.store.open('menu')
  }
}

/** The trigger plus every dropdown menu part (content, items, groups, sub menus). */
export const IV_CONTEXT_MENU_IMPORTS = [IvContextMenu, IvContextMenuTrigger, ...IV_DROPDOWN_MENU_IMPORTS] as const

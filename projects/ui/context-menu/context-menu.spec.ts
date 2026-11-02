import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { IV_CONTEXT_MENU_IMPORTS } from '@inlaylab/ivorie/context-menu'

@Component({
  imports: [IV_CONTEXT_MENU_IMPORTS],
  template: `
    <iv-context-menu>
      <div id="area" ivContextMenuTrigger class="h-40 w-60">Right-click here</div>
      <iv-dropdown-menu-content>
        <iv-dropdown-menu-item (select)="picked.set('back')">Back</iv-dropdown-menu-item>
        <iv-dropdown-menu-item>Reload</iv-dropdown-menu-item>
      </iv-dropdown-menu-content>
    </iv-context-menu>
  `,
})
class Host {
  picked = signal('')
}

const menu = () => document.querySelector('[role="menu"]') as HTMLElement | null

afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')))

describe('IvContextMenu', () => {
  it('opens a menu at the pointer on contextmenu and blocks the browser menu', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const area = fixture.nativeElement.querySelector('#area') as HTMLElement
    const event = new MouseEvent('contextmenu', { clientX: 120, clientY: 80, bubbles: true, cancelable: true })
    area.dispatchEvent(event)
    await fixture.whenStable()
    expect(event.defaultPrevented).toBe(true)
    expect(area.dataset['state']).toBe('open')
    expect(menu()).not.toBeNull()
    const pane = document.querySelector('.cdk-overlay-pane') as HTMLElement
    expect(pane.style.left).toBe('120px')
    expect(pane.style.top).toBe('80px')
    ;(menu()!.querySelector('[role="menuitem"]') as HTMLElement).click()
    await fixture.whenStable()
    expect(fixture.componentInstance.picked()).toBe('back')
    expect(menu()).toBeNull()
  })

  it('has no axe violations when open', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    fixture.nativeElement.querySelector('#area').dispatchEvent(new MouseEvent('contextmenu', { clientX: 5, clientY: 5, bubbles: true }))
    await fixture.whenStable()
    await expect(menu()!).toHaveNoViolations()
  })
})

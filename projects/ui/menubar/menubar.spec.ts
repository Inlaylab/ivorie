import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { IV_MENUBAR_IMPORTS } from '@inlaylab/ivorie/menubar'

@Component({
  imports: [IV_MENUBAR_IMPORTS],
  template: `
    <iv-menubar class="w-fit">
      <iv-menubar-menu>
        <button ivMenubarTrigger>File</button>
        <iv-dropdown-menu-content>
          <iv-dropdown-menu-item>New tab</iv-dropdown-menu-item>
        </iv-dropdown-menu-content>
      </iv-menubar-menu>
      <iv-menubar-menu>
        <button ivMenubarTrigger>Edit</button>
        <iv-dropdown-menu-content>
          <iv-dropdown-menu-item>Undo</iv-dropdown-menu-item>
        </iv-dropdown-menu-content>
      </iv-menubar-menu>
    </iv-menubar>
  `,
})
class Host {}

const menus = () => [...document.querySelectorAll('[role="menu"]')] as HTMLElement[]
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')))

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const triggers = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[]
  return { fixture, triggers }
}

describe('IvMenubar', () => {
  it('has menubar roles and one tab stop', async () => {
    const { fixture, triggers } = await setup()
    const bar = fixture.nativeElement.querySelector('iv-menubar') as HTMLElement
    expect(bar.getAttribute('role')).toBe('menubar')
    expect(bar.classList).toContain('cn-menubar')
    expect(triggers.map((t) => t.getAttribute('role'))).toEqual(['menuitem', 'menuitem'])
    expect(triggers.map((t) => t.tabIndex)).toEqual([0, -1])
  })

  it('click opens a menu without a backdrop; hover switches to the next menu', async () => {
    const { fixture, triggers } = await setup()
    triggers[0].click()
    await fixture.whenStable()
    expect(menus()[0].textContent).toContain('New tab')
    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull()
    triggers[1].dispatchEvent(new MouseEvent('mouseenter'))
    await fixture.whenStable()
    expect(menus().length).toBe(1)
    expect(menus()[0].textContent).toContain('Undo')
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true')
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false')
  })

  it('arrows move between triggers, and between open menus', async () => {
    const { fixture, triggers } = await setup()
    triggers[0].focus()
    key(triggers[0], 'ArrowRight')
    await fixture.whenStable()
    expect(document.activeElement).toBe(triggers[1])
    expect(triggers.map((t) => t.tabIndex)).toEqual([-1, 0])
    expect(menus().length).toBe(0)
    key(triggers[1], 'ArrowDown')
    await fixture.whenStable()
    expect(menus()[0].textContent).toContain('Undo')
    key(menus()[0], 'ArrowRight')
    await fixture.whenStable()
    expect(menus().length).toBe(1)
    expect(menus()[0].textContent).toContain('New tab')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

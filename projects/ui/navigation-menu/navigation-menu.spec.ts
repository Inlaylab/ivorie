import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { IV_NAVIGATION_MENU_IMPORTS } from '@inlaylab/ivorie/navigation-menu'

@Component({
  imports: [IV_NAVIGATION_MENU_IMPORTS],
  template: `
    <iv-navigation-menu>
      <ul ivNavigationMenuList>
        <li ivNavigationMenuItem value="start">
          <button ivNavigationMenuTrigger id="t1">Getting started</button>
          <iv-navigation-menu-content><a ivNavigationMenuLink href="#intro">Introduction</a></iv-navigation-menu-content>
        </li>
        <li ivNavigationMenuItem value="components">
          <button ivNavigationMenuTrigger id="t2">Components</button>
          <iv-navigation-menu-content><a ivNavigationMenuLink href="#button">Button</a></iv-navigation-menu-content>
        </li>
        <li ivNavigationMenuItem><a ivNavigationMenuLink href="#docs" [active]="true">Docs</a></li>
      </ul>
    </iv-navigation-menu>
  `,
})
class Host {}

const content = () => document.querySelector('[data-slot="navigation-menu-content"]') as HTMLElement | null
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')))

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  return { fixture, el, t1: el.querySelector('#t1') as HTMLButtonElement, t2: el.querySelector('#t2') as HTMLButtonElement }
}

describe('IvNavigationMenu', () => {
  it('renders a labelled nav with list, items, chevron triggers and an active link', async () => {
    const { el, t1 } = await setup()
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Main')
    expect(el.querySelector('[data-slot="navigation-menu-list"]')?.tagName).toBe('UL')
    expect(t1.querySelector('.cn-navigation-menu-trigger-icon')?.getAttribute('aria-hidden')).toBe('true')
    expect(t1.getAttribute('aria-expanded')).toBe('false')
    const active = el.querySelector('a[href="#docs"]') as HTMLElement
    expect(active.getAttribute('aria-current')).toBe('page')
  })

  it('click toggles a panel; moving to the next trigger slides the panel in from the end', async () => {
    const { fixture, t1, t2 } = await setup()
    t1.click()
    await fixture.whenStable()
    expect(t1.getAttribute('aria-expanded')).toBe('true')
    expect(content()!.textContent).toContain('Introduction')
    expect(t1.getAttribute('aria-controls')).toBe(content()!.id)
    t2.dispatchEvent(new MouseEvent('mouseenter'))
    await fixture.whenStable()
    expect(content()!.textContent).toContain('Button')
    expect(content()!.dataset['motion']).toBe('from-end')
    t2.click()
    await fixture.whenStable()
    expect(content()).toBeNull()
  })

  it('hover opens after a delay and closes after leaving', async () => {
    const { fixture, t1 } = await setup()
    t1.dispatchEvent(new MouseEvent('mouseenter'))
    await fixture.whenStable()
    expect(content()).toBeNull()
    await wait(250)
    await fixture.whenStable()
    expect(content()).not.toBeNull()
    t1.dispatchEvent(new MouseEvent('mouseleave'))
    await wait(200)
    await fixture.whenStable()
    expect(content()).toBeNull()
  })

  it('Escape closes and focuses the trigger; following a link closes', async () => {
    const { fixture, t1 } = await setup()
    t1.click()
    await fixture.whenStable()
    const link = content()!.querySelector('a') as HTMLElement
    link.focus()
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await fixture.whenStable()
    expect(content()).toBeNull()
    expect(document.activeElement).toBe(t1)
    t1.click()
    await fixture.whenStable()
    ;(content()!.querySelector('a') as HTMLElement).click()
    await fixture.whenStable()
    expect(content()).toBeNull()
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Overlay } from '@angular/cdk/overlay'
import { describe, expect, it, vi } from 'vitest'
import { IvDialog } from '@ivorie/ui/dialog'
import { IV_DROPDOWN_MENU_IMPORTS } from './dropdown-menu'

@Component({
  selector: 'menu-host',
  imports: [IV_DROPDOWN_MENU_IMPORTS],
  template: `
    <iv-dropdown-menu>
      <button ivDropdownMenuTrigger>Open</button>
      <iv-dropdown-menu-content class="w-56">
        <iv-dropdown-menu-label>My Account</iv-dropdown-menu-label>
        <iv-dropdown-menu-group>
          <iv-dropdown-menu-item (select)="selected.push('profile')"
            >Profile <iv-dropdown-menu-shortcut>⌘P</iv-dropdown-menu-shortcut></iv-dropdown-menu-item
          >
          <iv-dropdown-menu-item [disabled]="true">Billing</iv-dropdown-menu-item>
          <iv-dropdown-menu-item><a href="#settings">Settings</a></iv-dropdown-menu-item>
          <iv-dropdown-menu-item [closeOnSelect]="false" variant="destructive" (select)="selected.push('copy')"
            >Copy</iv-dropdown-menu-item
          >
        </iv-dropdown-menu-group>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-checkbox-item [(checked)]="bar" [inset]="true">Status bar</iv-dropdown-menu-checkbox-item>
        <iv-dropdown-menu-radio-group [(value)]="pos">
          <iv-dropdown-menu-radio-item value="top">Top</iv-dropdown-menu-radio-item>
          <iv-dropdown-menu-radio-item value="bottom">Bottom</iv-dropdown-menu-radio-item>
        </iv-dropdown-menu-radio-group>
        <iv-dropdown-menu-sub>
          <iv-dropdown-menu-sub-trigger>More</iv-dropdown-menu-sub-trigger>
          <iv-dropdown-menu-sub-content>
            <iv-dropdown-menu-item (select)="selected.push('email')">Email</iv-dropdown-menu-item>
            <iv-dropdown-menu-item>Message</iv-dropdown-menu-item>
          </iv-dropdown-menu-sub-content>
        </iv-dropdown-menu-sub>
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
class Host {
  selected: string[] = []
  bar = signal(false)
  pos = signal<string | null>('top')
}

const keyCodes: Record<string, number> = {
  ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39,
  Home: 36, End: 35, Escape: 27, Enter: 13, ' ': 32, Tab: 9,
}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const trigger = fixture.nativeElement.querySelector('[ivDropdownMenuTrigger]') as HTMLButtonElement
  const stable = () => fixture.whenStable()
  const key = async (key: string, target: Element = document.activeElement ?? document.body) => {
    const keyCode = keyCodes[key] ?? key.toUpperCase().charCodeAt(0)
    const event = new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    await stable()
    return event
  }
  const menus = () => [...document.querySelectorAll<HTMLElement>('[role="menu"]')]
  const focused = () => document.activeElement?.textContent?.replace('⌘P', '').trim()
  return { fixture, host: fixture.componentInstance, trigger, key, menus, focused, stable }
}

describe('IvDropdownMenu', () => {
  it('creates no overlay before open', async () => {
    const create = vi.spyOn(TestBed.inject(Overlay), 'create')
    const { menus, trigger } = await render()
    expect(create).not.toHaveBeenCalled()
    expect(menus()).toEqual([])
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('ArrowDown on the trigger opens and focuses the first item', async () => {
    const { trigger, key, menus, focused } = await render()
    await key('ArrowDown', trigger)
    expect(menus().length).toBe(1)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(focused()).toBe('Profile')
  })

  it('Enter and Space on the trigger open on the first item; ArrowUp on the last', async () => {
    for (const k of ['Enter', ' ']) {
      const { trigger, key, focused, fixture } = await render()
      const event = await key(k, trigger)
      expect(event.defaultPrevented).toBe(true)
      expect(focused()).toBe('Profile')
      fixture.destroy()
    }
    const { trigger, key, focused } = await render()
    await key('ArrowUp', trigger)
    expect(focused()).toBe('More')
  })

  it('arrows move focus, skip the disabled item and wrap; Home / End', async () => {
    const { trigger, key, focused } = await render()
    await key('ArrowDown', trigger)
    await key('ArrowDown')
    expect(focused()).toBe('Settings')
    await key('ArrowDown')
    expect(focused()).toBe('Copy')
    await key('ArrowUp')
    await key('ArrowUp')
    await key('ArrowUp')
    expect(focused()).toBe('More')
    await key('Home')
    expect(focused()).toBe('Profile')
    await key('End')
    expect(focused()).toBe('More')
  })

  it('typeahead "c" focuses Copy', async () => {
    const { trigger, key, focused } = await render()
    await key('ArrowDown', trigger)
    await key('c')
    await new Promise((r) => setTimeout(r, 300))
    expect(focused()).toBe('Copy')
  })

  it('Enter on an item emits select, closes and focuses the trigger', async () => {
    const { host, trigger, key, menus } = await render()
    await key('ArrowDown', trigger)
    await key('Enter')
    expect(host.selected).toEqual(['profile'])
    expect(menus()).toEqual([])
    expect(document.activeElement).toBe(trigger)
  })

  it('a mouse click on a link inside an item is not cancelled', async () => {
    const { trigger, stable } = await render()
    trigger.click()
    await stable()
    const link = document.querySelector<HTMLAnchorElement>('[role="menuitem"] a')!
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(click)
    expect(click.defaultPrevented).toBe(false)
  })

  it('closeOnSelect=false keeps it open', async () => {
    const { host, trigger, key, menus } = await render()
    await key('ArrowDown', trigger)
    await key('ArrowDown')
    await key('ArrowDown')
    await key('Enter')
    expect(host.selected).toEqual(['copy'])
    expect(menus().length).toBe(1)
  })

  it('checkbox item toggles checked (two-way); radio item sets the group value', async () => {
    const { host, trigger, stable } = await render()
    trigger.click()
    await stable()
    const item = (role: string, text: string) =>
      [...document.querySelectorAll<HTMLElement>(`[role="${role}"]`)].find((e) => e.textContent!.trim() === text)!
    const checkbox = item('menuitemcheckbox', 'Status bar')
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
    checkbox.click()
    await stable()
    expect(host.bar()).toBe(true)
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
    item('menuitemradio', 'Bottom').click()
    await stable()
    expect(host.pos()).toBe('bottom')
  })

  it('Escape closes and focuses the trigger; Tab closes', async () => {
    const { trigger, key, menus } = await render()
    await key('ArrowDown', trigger)
    await key('Escape')
    expect(menus()).toEqual([])
    expect(document.activeElement).toBe(trigger)
    await key('ArrowDown', trigger)
    await key('Tab')
    expect(menus()).toEqual([])
  })

  it('ArrowRight opens a sub menu on its first item; ArrowLeft and Escape close it', async () => {
    const { host, trigger, key, menus, focused } = await render()
    await key('ArrowUp', trigger)
    expect(focused()).toBe('More')
    await key('ArrowRight')
    expect(menus().length).toBe(2)
    expect(focused()).toBe('Email')
    await key('ArrowLeft')
    expect(menus().length).toBe(1)
    expect(focused()).toBe('More')
    await key('Enter')
    expect(focused()).toBe('Email')
    await key('Escape')
    expect(menus().length).toBe(1)
    expect(focused()).toBe('More')
    await key('ArrowRight')
    await key('Enter')
    expect(host.selected).toEqual(['email'])
    expect(menus()).toEqual([])
    expect(document.activeElement).toBe(trigger)
  })

  it('hovering a sibling item closes an open sub menu (H5)', async () => {
    const { trigger, stable, menus } = await render()
    trigger.click()
    await stable()
    const item = (text: string) =>
      [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find((e) => e.textContent!.trim() === text)!
    item('More').dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await stable()
    expect(menus().length).toBe(2)
    item('Settings').dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await stable()
    expect(menus().length).toBe(1)
  })

  it('Space during a typeahead search does not activate the item (H5)', async () => {
    const { host, trigger, key, menus } = await render()
    await key('ArrowDown', trigger)
    await key('c')
    await key(' ')
    expect(menus().length).toBe(1)
    expect(host.selected).toEqual([])
  })

  it('hovering a sub-trigger opens its menu without moving focus off the trigger (H5)', async () => {
    const { trigger, stable } = await render()
    trigger.click()
    await stable()
    const subTrigger = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
      (e) => e.textContent!.trim() === 'More',
    )!
    subTrigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await stable()
    expect(document.querySelector('[data-slot="dropdown-menu-sub-content"]')).not.toBeNull()
    expect(document.activeElement).toBe(subTrigger)
  })

  it('hooks, slots and data attributes', async () => {
    const { trigger, stable } = await render()
    trigger.click()
    await stable()
    const q = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!
    const content = q('dropdown-menu-content')
    for (const hook of ['cn-dropdown-menu-content', 'cn-menu-target', 'cn-menu-translucent', 'w-56'])
      expect(content.classList).toContain(hook)
    expect(content.dataset['state']).toBe('open')
    expect(q('dropdown-menu-item').classList).toContain('cn-dropdown-menu-item')
    expect(q('dropdown-menu-label').classList).toContain('cn-dropdown-menu-label')
    expect(q('dropdown-menu-separator').classList).toContain('cn-dropdown-menu-separator')
    expect(q('dropdown-menu-shortcut').classList).toContain('cn-dropdown-menu-shortcut')
    expect(q('dropdown-menu-checkbox-item').classList).toContain('cn-dropdown-menu-checkbox-item')
    expect(q('dropdown-menu-checkbox-item').hasAttribute('data-inset')).toBe(true)
    expect(q('dropdown-menu-radio-item').classList).toContain('cn-dropdown-menu-radio-item')
    expect(q('dropdown-menu-radio-item').querySelector('.cn-dropdown-menu-item-indicator')).not.toBeNull()
    expect(q('dropdown-menu-sub-trigger').classList).toContain('cn-dropdown-menu-sub-trigger')
    expect(q('dropdown-menu-sub-trigger').querySelector('.cn-rtl-flip')).not.toBeNull()
    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-item"]')]
    expect(items.every((i) => i.getAttribute('tabindex') === '-1')).toBe(true)
    const billing = items.find((i) => i.textContent!.trim() === 'Billing')!
    expect(billing.getAttribute('aria-disabled')).toBe('true')
    expect(billing.hasAttribute('data-disabled')).toBe(true)
    expect(items.find((i) => i.textContent!.trim() === 'Copy')!.dataset['variant']).toBe('destructive')
  })

  it('sub content has its hooks', async () => {
    const { trigger, key } = await render()
    await key('ArrowUp', trigger)
    await key('ArrowRight')
    const sub = document.querySelector<HTMLElement>('[data-slot="dropdown-menu-sub-content"]')!
    for (const hook of ['cn-dropdown-menu-sub-content', 'cn-menu-target', 'cn-menu-translucent'])
      expect(sub.classList).toContain(hook)
  })

  it('destroy while open leaves no overlay in the body', async () => {
    const { fixture, trigger, key, menus } = await render()
    await key('ArrowUp', trigger)
    await key('ArrowRight')
    expect(menus().length).toBe(2)
    fixture.destroy()
    expect(menus()).toEqual([])
  })

  it('menu inside a dialog: Escape closes only the menu', async () => {
    const dialog = TestBed.inject(IvDialog)
    const ref = dialog.open(Host)
    const closed = vi.fn()
    ref.afterClosed().subscribe(closed)
    await new Promise((r) => setTimeout(r))
    const trigger = document.querySelector('.cdk-overlay-container [ivDropdownMenuTrigger]') as HTMLButtonElement
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true, cancelable: true }))
    TestBed.tick()
    await new Promise((r) => setTimeout(r))
    expect(document.querySelectorAll('[role="menu"]').length).toBe(1)
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true }),
    )
    TestBed.tick()
    await new Promise((r) => setTimeout(r))
    expect(document.querySelectorAll('[role="menu"]').length).toBe(0)
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(closed).not.toHaveBeenCalled()
    ref.close()
    await new Promise((r) => setTimeout(r, 300))
  })

  it('axe passes on the open menu', async () => {
    const { fixture, trigger, key } = await render()
    await key('ArrowDown', trigger)
    await expect(fixture.nativeElement).toHaveNoViolations()
    await expect(document.querySelector('.cdk-overlay-container') as HTMLElement).toHaveNoViolations()
  })
})

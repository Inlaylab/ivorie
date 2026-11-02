import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_COMMAND_IMPORTS } from '@inlaylab/ivorie/command'

@Component({
  imports: [IV_COMMAND_IMPORTS],
  template: `
    <iv-command class="rounded-lg border" [(search)]="search">
      <iv-command-input placeholder="Type a command" />
      <iv-command-list>
        <iv-command-empty>No results.</iv-command-empty>
        <iv-command-group heading="Suggestions">
          <iv-command-item (select)="picked.set($event)">Calendar</iv-command-item>
          <iv-command-item [disabled]="true">Search emoji</iv-command-item>
          <iv-command-item [keywords]="['math']" (select)="picked.set($event)">Calculator</iv-command-item>
        </iv-command-group>
        <iv-command-separator />
        <iv-command-group heading="Settings">
          <iv-command-item value="Profile" (select)="picked.set($event)">Profile<iv-command-shortcut>⌘P</iv-command-shortcut></iv-command-item>
        </iv-command-group>
      </iv-command-list>
    </iv-command>
  `,
})
class Host {
  search = signal('')
  picked = signal('')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const input = el.querySelector('input') as HTMLInputElement
  const items = () => [...el.querySelectorAll('[role="option"]')] as HTMLElement[]
  const visible = () => items().filter((i) => !i.hidden).map((i) => i.textContent!.trim())
  const type = async (text: string) => {
    input.value = text
    input.dispatchEvent(new Event('input'))
    await fixture.whenStable()
  }
  // The CDK key manager reads keyCode.
  const keyCodes: Record<string, number> = { ArrowUp: 38, ArrowDown: 40, Enter: 13 }
  const key = async (k: string) => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: k, keyCode: keyCodes[k], bubbles: true, cancelable: true }))
    await fixture.whenStable()
  }
  return { fixture, el, input, items, visible, type, key }
}

describe('IvCommand', () => {
  it('links the input to the list and highlights the first item', async () => {
    const { el, input, items } = await setup()
    const list = el.querySelector('[role="listbox"]')!
    expect(input.getAttribute('role')).toBe('combobox')
    expect(input.getAttribute('aria-controls')).toBe(list.id)
    expect(input.getAttribute('aria-activedescendant')).toBe(items()[0].id)
    expect(items()[0].getAttribute('aria-selected')).toBe('true')
    expect((el.querySelector('[data-slot="command-empty"]') as HTMLElement).hidden).toBe(true)
  })

  it('filters by text and keywords; hides empty groups; shows the empty state', async () => {
    const { el, fixture, visible, type } = await setup()
    await type('cal')
    expect(visible()).toEqual(['Calendar', 'Calculator'])
    expect(fixture.componentInstance.search()).toBe('cal')
    const groups = [...el.querySelectorAll('[role="group"]')] as HTMLElement[]
    expect(groups[1].hidden).toBe(true)
    await type('math')
    expect(visible()).toEqual(['Calculator'])
    await type('zzz')
    expect(visible()).toEqual([])
    expect((el.querySelector('[data-slot="command-empty"]') as HTMLElement).hidden).toBe(false)
  })

  it('arrows skip disabled items and wrap; Enter picks', async () => {
    const { fixture, input, items, key } = await setup()
    await key('ArrowDown')
    expect(input.getAttribute('aria-activedescendant')).toBe(items()[2].id)
    await key('ArrowDown')
    await key('ArrowDown')
    expect(input.getAttribute('aria-activedescendant')).toBe(items()[0].id)
    await key('ArrowUp')
    await key('Enter')
    expect(fixture.componentInstance.picked()).toBe('Profile')
  })

  it('click picks; a disabled item does nothing', async () => {
    const { fixture, items } = await setup()
    items()[1].click()
    expect(fixture.componentInstance.picked()).toBe('')
    items()[2].click()
    expect(fixture.componentInstance.picked()).toBe('Calculator')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

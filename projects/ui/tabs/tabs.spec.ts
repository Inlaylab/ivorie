import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_TABS_IMPORTS, TabsListVariants, tabsListVariants } from '@inlaylab/ivorie/tabs'

describe('tabsListVariants', () => {
  it('is exported with its type and carries the variant hook', () => {
    const v: TabsListVariants = { variant: 'line' }
    expect(tabsListVariants(v)).toContain('cn-tabs-list-variant-line')
    expect(tabsListVariants()).toContain('cn-tabs-list-variant-default')
  })
})

interface Tab {
  value: string
  label: string
  disabled?: boolean
}

@Component({
  imports: [IV_TABS_IMPORTS],
  template: `
    <iv-tabs
      [value]="value()"
      defaultValue="account"
      [orientation]="orientation()"
      (valueChange)="changes.push($event)"
      class="extra"
    >
      <iv-tabs-list [variant]="variant()" aria-label="Settings">
        @for (tab of tabs(); track tab.value) {
          <iv-tabs-trigger [value]="tab.value" [disabled]="tab.disabled ?? false">{{ tab.label }}</iv-tabs-trigger>
        }
      </iv-tabs-list>
      @for (tab of tabs(); track tab.value) {
        <iv-tabs-content [value]="tab.value">Panel {{ tab.label }}</iv-tabs-content>
      }
    </iv-tabs>
  `,
})
class Host {
  value = signal<string | undefined>(undefined)
  orientation = signal<'horizontal' | 'vertical'>('horizontal')
  variant = signal<'default' | 'line'>('default')
  tabs = signal<Tab[]>([
    { value: 'account', label: 'Account' },
    { value: 'billing', label: 'Billing', disabled: true },
    { value: 'password', label: 'Password' },
    { value: 'team', label: 'Team' },
  ])
  changes: string[] = []
}

const keyCodes: Record<string, number> = { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35 }

async function render(setup?: (h: Host) => void) {
  const fixture = TestBed.createComponent(Host)
  setup?.(fixture.componentInstance)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const stable = () => fixture.whenStable()
  const tab = (label: string) =>
    Array.from(el.querySelectorAll<HTMLElement>('[role="tab"]')).find((t) => t.textContent!.trim() === label)!
  const panel = (label: string) =>
    Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]')).find(
      (p) => p.textContent!.trim() === `Panel ${label}`,
    )!
  const selected = () => el.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim()
  const tabbable = () =>
    Array.from(el.querySelectorAll<HTMLElement>('[role="tab"][tabindex="0"]')).map((t) => t.textContent!.trim())
  const key = async (key: string, target = document.activeElement as HTMLElement) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode: keyCodes[key], bubbles: true, cancelable: true }))
    await stable()
  }
  const focused = () => document.activeElement?.textContent?.trim()
  return { fixture, host: fixture.componentInstance, el, stable, tab, panel, selected, tabbable, key, focused }
}

describe('IvTabs', () => {
  it('hooks on every part', async () => {
    const { el, tab, panel } = await render((h) => h.variant.set('line'))
    const root = el.querySelector<HTMLElement>('iv-tabs')!
    expect(root.classList).toContain('cn-tabs')
    expect(root.classList).toContain('extra')
    const list = el.querySelector<HTMLElement>('[role="tablist"]')!
    expect(list.classList).toContain('cn-tabs-list')
    expect(list.classList).toContain('cn-tabs-list-variant-line')
    expect(list.dataset['variant']).toBe('line')
    expect(tab('Account').classList).toContain('cn-tabs-trigger')
    expect(panel('Account').classList).toContain('cn-tabs-content')
  })

  it('defaultValue selects; tabs and panels are wired both ways', async () => {
    const { selected, tab, panel } = await render()
    expect(selected()).toBe('Account')
    const t = tab('Account')
    const p = panel('Account')
    expect(t.dataset['state']).toBe('active')
    expect(t.getAttribute('aria-controls')).toBe(p.id)
    expect(p.getAttribute('aria-labelledby')).toBe(t.id)
    expect(p.getAttribute('tabindex')).toBe('0')
    expect(p.hidden).toBe(false)
    expect(panel('Team').hidden).toBe(true)
    expect(tab('Team').dataset['state']).toBe('inactive')
  })

  it('click selects and emits once; a disabled tab does nothing', async () => {
    const { host, tab, selected, stable } = await render()
    tab('Team').click()
    await stable()
    expect(selected()).toBe('Team')
    expect(host.changes).toEqual(['team'])
    tab('Billing').click()
    await stable()
    expect(selected()).toBe('Team')
    expect(tab('Billing').getAttribute('aria-disabled')).toBe('true')
    expect(host.changes).toEqual(['team'])
  })

  it('[value] from the parent wins and does not echo', async () => {
    const { host, tab, selected, stable } = await render()
    tab('Team').click()
    await stable()
    host.value.set('password')
    await stable()
    expect(selected()).toBe('Password')
    expect(host.changes).toEqual(['team'])
  })

  it('roving tabindex: only the selected tab is tabbable', async () => {
    const { tabbable } = await render()
    expect(tabbable()).toEqual(['Account'])
  })

  it('selected value not among the tabs: the first enabled tab is tabbable', async () => {
    const { tabbable } = await render((h) => h.value.set('nope'))
    expect(tabbable()).toEqual(['Account'])
  })

  it('ArrowRight / ArrowLeft move, select and wrap, skipping disabled; Home / End', async () => {
    const { host, tab, key, focused, selected } = await render()
    tab('Account').focus()
    await key('ArrowRight')
    expect(focused()).toBe('Password')
    expect(selected()).toBe('Password')
    await key('ArrowRight')
    await key('ArrowRight')
    expect(focused()).toBe('Account')
    await key('ArrowLeft')
    expect(selected()).toBe('Team')
    await key('Home')
    expect(selected()).toBe('Account')
    await key('End')
    expect(selected()).toBe('Team')
    expect(host.changes).toEqual(['password', 'team', 'account', 'team', 'account', 'team'])
  })

  it('horizontal ignores ArrowDown; vertical uses ArrowDown / ArrowUp', async () => {
    const h = await render()
    h.tab('Account').focus()
    await h.key('ArrowDown')
    expect(h.selected()).toBe('Account')
    h.fixture.destroy()

    const v = await render((host) => host.orientation.set('vertical'))
    expect(v.el.querySelector('[role="tablist"]')!.getAttribute('aria-orientation')).toBe('vertical')
    v.tab('Account').focus()
    await v.key('ArrowDown')
    expect(v.selected()).toBe('Password')
    await v.key('ArrowUp')
    expect(v.selected()).toBe('Account')
    await v.key('ArrowRight')
    expect(v.selected()).toBe('Account')
  })

  it('all tabs disabled: no tabbable tab, arrows do not throw', async () => {
    const { el, key, tabbable } = await render((h) =>
      h.tabs.set([
        { value: 'a', label: 'A', disabled: true },
        { value: 'b', label: 'B', disabled: true },
      ]),
    )
    expect(tabbable()).toEqual([])
    const first = el.querySelector<HTMLElement>('[role="tab"]')!
    await key('ArrowRight', first)
    expect(el.querySelector('[role="tab"][aria-selected="true"]')).toBeNull()
  })

  it('axe passes', async () => {
    const { fixture } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

@Component({
  imports: [IV_TABS_IMPORTS],
  template: `
    <iv-tabs defaultValue="outer-a">
      <iv-tabs-list>
        <iv-tabs-trigger value="outer-a">Outer A</iv-tabs-trigger>
        <iv-tabs-trigger value="outer-b">Outer B</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="outer-a">
        <iv-tabs defaultValue="i1">
          <iv-tabs-list>
            <iv-tabs-trigger value="i1">Inner 1</iv-tabs-trigger>
            <iv-tabs-trigger value="i2">Inner 2</iv-tabs-trigger>
            <iv-tabs-trigger value="i3">Inner 3</iv-tabs-trigger>
          </iv-tabs-list>
          <iv-tabs-content value="i1">Inner panel 1</iv-tabs-content>
          <iv-tabs-content value="i2">Inner panel 2</iv-tabs-content>
          <iv-tabs-content value="i3">Inner panel 3</iv-tabs-content>
        </iv-tabs>
      </iv-tabs-content>
      <iv-tabs-content value="outer-b">Outer panel B</iv-tabs-content>
    </iv-tabs>
  `,
})
class NestedHost {}

describe('IvTabs nested', () => {
  it('ArrowRight on an inner tab moves one inner tab; the outer selection stays', async () => {
    const fixture = TestBed.createComponent(NestedHost)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const tab = (label: string) =>
      Array.from(el.querySelectorAll<HTMLElement>('[role="tab"]')).find((t) => t.textContent!.trim() === label)!
    tab('Inner 1').focus()
    tab('Inner 1').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, bubbles: true, cancelable: true }))
    await fixture.whenStable()
    expect(document.activeElement).toBe(tab('Inner 2'))
    expect(tab('Inner 2').getAttribute('aria-selected')).toBe('true')
    expect(tab('Outer A').getAttribute('aria-selected')).toBe('true')
  })
})

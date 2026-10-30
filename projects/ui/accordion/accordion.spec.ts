import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_ACCORDION_IMPORTS } from './accordion'

@Component({
  imports: [IV_ACCORDION_IMPORTS],
  template: `
    <iv-accordion
      [type]="type()"
      [collapsible]="collapsible()"
      [value]="value()"
      (valueChange)="changes.push($event)"
      class="extra"
    >
      @for (item of items(); track item.value) {
        <iv-accordion-item [value]="item.value" [disabled]="item.disabled ?? false">
          <iv-accordion-trigger>{{ item.label }}</iv-accordion-trigger>
          <iv-accordion-content>Body {{ item.label }}</iv-accordion-content>
        </iv-accordion-item>
      }
    </iv-accordion>
  `,
})
class Host {
  type = signal<'single' | 'multiple'>('single')
  collapsible = signal(true)
  value = signal<string | string[] | null>(null)
  items = signal<{ value: string; label: string; disabled?: boolean }[]>([
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta', disabled: true },
    { value: 'c', label: 'Gamma' },
  ])
  changes: (string | string[] | null)[] = []
}

const keyCodes: Record<string, number> = { ArrowUp: 38, ArrowDown: 40, Home: 36, End: 35 }

async function render(setup?: (h: Host) => void) {
  const fixture = TestBed.createComponent(Host)
  setup?.(fixture.componentInstance)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const stable = () => fixture.whenStable()
  const button = (label: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]')).find(
      (b) => b.textContent!.trim() === label,
    )!
  const item = (label: string) => button(label).closest<HTMLElement>('iv-accordion-item')!
  const content = (label: string) => item(label).querySelector<HTMLElement>('iv-accordion-content')!
  const click = async (label: string) => {
    button(label).click()
    await stable()
  }
  const key = async (key: string) => {
    const target = document.activeElement as HTMLElement
    target.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode: keyCodes[key], bubbles: true, cancelable: true }))
    await stable()
  }
  const focused = () => document.activeElement?.textContent?.trim()
  return { fixture, host: fixture.componentInstance, el, stable, button, item, content, click, key, focused }
}

describe('IvAccordion', () => {
  it('hooks on every part; trigger sits in a heading', async () => {
    const { el, button, item, content } = await render()
    const root = el.querySelector<HTMLElement>('iv-accordion')!
    expect(root.classList).toContain('cn-accordion')
    expect(root.classList).toContain('extra')
    expect(item('Alpha').classList).toContain('cn-accordion-item')
    expect(button('Alpha').classList).toContain('cn-accordion-trigger')
    expect(button('Alpha').parentElement!.tagName).toBe('H3')
    expect(button('Alpha').querySelectorAll('.cn-accordion-trigger-icon').length).toBe(2)
    expect(content('Alpha').classList).toContain('cn-accordion-content')
    expect(content('Alpha').querySelector('.cn-accordion-content-inner')).not.toBeNull()
  })

  it('trigger and region are wired to each other', async () => {
    const { button, content, click } = await render()
    const b = button('Alpha')
    const c = content('Alpha')
    expect(b.getAttribute('aria-expanded')).toBe('false')
    expect(b.getAttribute('aria-controls')).toBe(c.id)
    expect(c.getAttribute('role')).toBe('region')
    expect(c.getAttribute('aria-labelledby')).toBe(b.id)
    expect(c.hidden).toBe(true)
    await click('Alpha')
    expect(b.getAttribute('aria-expanded')).toBe('true')
    expect(c.hidden).toBe(false)
    expect(c.dataset['state']).toBe('open')
  })

  it('single: opening one closes the other and emits once each', async () => {
    const { host, item, click } = await render()
    await click('Alpha')
    await click('Gamma')
    expect(item('Alpha').dataset['state']).toBe('closed')
    expect(item('Gamma').dataset['state']).toBe('open')
    expect(host.changes).toEqual(['a', 'c'])
  })

  it('single + collapsible=false keeps the open item open', async () => {
    const { host, item, click } = await render((h) => h.collapsible.set(false))
    await click('Alpha')
    await click('Alpha')
    expect(item('Alpha').dataset['state']).toBe('open')
    expect(host.changes).toEqual(['a'])
  })

  it('multiple keeps both open', async () => {
    const { host, item, click } = await render((h) => h.type.set('multiple'))
    await click('Alpha')
    await click('Gamma')
    expect(item('Alpha').dataset['state']).toBe('open')
    expect(item('Gamma').dataset['state']).toBe('open')
    expect(host.changes).toEqual([['a'], ['a', 'c']])
  })

  it('[value] from the parent wins and does not echo', async () => {
    const { host, item, click, stable } = await render()
    await click('Alpha')
    host.value.set('c')
    await stable()
    expect(item('Alpha').dataset['state']).toBe('closed')
    expect(item('Gamma').dataset['state']).toBe('open')
    expect(host.changes).toEqual(['a'])
  })

  it('disabled item: button disabled, click does nothing', async () => {
    const { host, button, item, click } = await render()
    expect(button('Beta').disabled).toBe(true)
    expect(item('Beta').hasAttribute('data-disabled')).toBe(true)
    await click('Beta')
    expect(host.changes).toEqual([])
  })

  it('arrows move focus between triggers, wrap and skip disabled; Home / End', async () => {
    const { button, key, focused } = await render()
    button('Alpha').focus()
    await key('ArrowDown')
    expect(focused()).toBe('Gamma')
    await key('ArrowDown')
    expect(focused()).toBe('Alpha')
    await key('ArrowUp')
    expect(focused()).toBe('Gamma')
    await key('Home')
    expect(focused()).toBe('Alpha')
    await key('End')
    expect(focused()).toBe('Gamma')
  })

  it('all items disabled: arrows do nothing and do not throw', async () => {
    const { el, key } = await render((h) =>
      h.items.set([
        { value: 'a', label: 'Alpha', disabled: true },
        { value: 'b', label: 'Beta', disabled: true },
      ]),
    )
    const root = el.querySelector<HTMLElement>('iv-accordion')!
    root.tabIndex = -1
    root.focus()
    await key('ArrowDown')
    expect(document.activeElement).toBe(root)
  })

  it('axe passes with an open item', async () => {
    const { fixture, click } = await render()
    await click('Alpha')
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

@Component({
  imports: [IV_ACCORDION_IMPORTS],
  template: `
    <iv-accordion [value]="'outer'">
      <iv-accordion-item value="outer">
        <iv-accordion-trigger>Outer</iv-accordion-trigger>
        <iv-accordion-content>
          <textarea aria-label="Notes"></textarea>
          <iv-accordion>
            <iv-accordion-item value="i1">
              <iv-accordion-trigger>Inner 1</iv-accordion-trigger>
              <iv-accordion-content>Inner body 1</iv-accordion-content>
            </iv-accordion-item>
            <iv-accordion-item value="i2">
              <iv-accordion-trigger>Inner 2</iv-accordion-trigger>
              <iv-accordion-content>Inner body 2</iv-accordion-content>
            </iv-accordion-item>
          </iv-accordion>
        </iv-accordion-content>
      </iv-accordion-item>
      <iv-accordion-item value="last">
        <iv-accordion-trigger>Last</iv-accordion-trigger>
        <iv-accordion-content>Last body</iv-accordion-content>
      </iv-accordion-item>
    </iv-accordion>
  `,
})
class NestedHost {}

describe('IvAccordion keys stay with their own triggers', () => {
  async function renderNested() {
    const fixture = TestBed.createComponent(NestedHost)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const button = (label: string) =>
      Array.from(el.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]')).find(
        (b) => b.textContent!.trim() === label,
      )!
    return { fixture, el, button }
  }

  it('arrow keys inside a field in an open panel are left alone', async () => {
    const { fixture, el } = await renderNested()
    const field = el.querySelector('textarea')!
    field.focus()
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true, cancelable: true })
    field.dispatchEvent(event)
    await fixture.whenStable()
    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(field)
  })

  it('a nested accordion moves focus once, inside itself', async () => {
    const { fixture, button } = await renderNested()
    button('Inner 1').focus()
    button('Inner 1').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true, cancelable: true }))
    await fixture.whenStable()
    expect(document.activeElement).toBe(button('Inner 2'))
  })
})

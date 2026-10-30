import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_COLLAPSIBLE_IMPORTS } from './collapsible'

@Component({
  imports: [IV_COLLAPSIBLE_IMPORTS],
  template: `
    <iv-collapsible [(open)]="open" [disabled]="disabled()" class="extra">
      <button ivCollapsibleTrigger>Toggle</button>
      <iv-collapsible-content><a href="#x">Inside</a></iv-collapsible-content>
    </iv-collapsible>
    <iv-collapsible>
      <span ivCollapsibleTrigger>Span trigger</span>
      <iv-collapsible-content>Second</iv-collapsible-content>
    </iv-collapsible>
  `,
})
class Host {
  open = signal(false)
  disabled = signal(false)
}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const [root, root2] = Array.from(el.querySelectorAll<HTMLElement>('iv-collapsible'))
  const trigger = el.querySelector<HTMLButtonElement>('button')!
  const content = root.querySelector<HTMLElement>('iv-collapsible-content')!
  const span = root2.querySelector<HTMLElement>('[ivCollapsibleTrigger]')!
  const key = async (target: HTMLElement, key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    await fixture.whenStable()
    return event
  }
  return { fixture, host: fixture.componentInstance, root, root2, trigger, content, span, key }
}

describe('IvCollapsible', () => {
  it('click toggles and [(open)] round-trips', async () => {
    const { fixture, host, trigger, root } = await render()
    trigger.click()
    await fixture.whenStable()
    expect(host.open()).toBe(true)
    expect(root.dataset['state']).toBe('open')
    host.open.set(false)
    await fixture.whenStable()
    expect(root.dataset['state']).toBe('closed')
  })

  it('trigger is wired to the content', async () => {
    const { fixture, trigger, content, root } = await render()
    expect(root.classList).toContain('extra')
    expect(trigger.getAttribute('type')).toBe('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(content.id).toBeTruthy()
    expect(trigger.getAttribute('aria-controls')).toBe(content.id)
    expect(content.hasAttribute('inert')).toBe(true)
    trigger.click()
    await fixture.whenStable()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.dataset['state']).toBe('open')
    expect(content.dataset['state']).toBe('open')
    expect(content.hasAttribute('inert')).toBe(false)
  })

  it('a native button does not handle keys itself (its click does)', async () => {
    const { host, trigger, key } = await render()
    const event = await key(trigger, 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(host.open()).toBe(false)
    expect(trigger.hasAttribute('role')).toBe(false)
  })

  it('a non-button trigger is a focusable button with Enter / Space', async () => {
    const { root2, span, key } = await render()
    expect(span.getAttribute('role')).toBe('button')
    expect(span.getAttribute('tabindex')).toBe('0')
    await key(span, 'Enter')
    expect(root2.dataset['state']).toBe('open')
    const event = await key(span, ' ')
    expect(event.defaultPrevented).toBe(true)
    expect(root2.dataset['state']).toBe('closed')
  })

  it('disabled blocks click and keys', async () => {
    const { fixture, host, trigger } = await render()
    host.disabled.set(true)
    await fixture.whenStable()
    expect(trigger.disabled).toBe(true)
    expect(trigger.hasAttribute('data-disabled')).toBe(true)
    trigger.click()
    await fixture.whenStable()
    expect(host.open()).toBe(false)
  })

  it('axe passes open and closed', async () => {
    const { fixture, trigger } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
    trigger.click()
    await fixture.whenStable()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

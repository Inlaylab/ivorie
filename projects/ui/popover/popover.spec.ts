import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { IV_POPOVER_IMPORTS } from '@inlaylab/ivorie/popover'

@Component({
  imports: [IV_POPOVER_IMPORTS],
  template: `
    <iv-popover [(open)]="open">
      <button type="button" id="t" ivPopoverTrigger>Settings</button>
      <iv-popover-content side="top" class="w-80">
        <iv-popover-header>
          <iv-popover-title>Dimensions</iv-popover-title>
          <iv-popover-description>Set the size.</iv-popover-description>
        </iv-popover-header>
        <input id="w" aria-label="Width" />
      </iv-popover-content>
    </iv-popover>
  `,
})
class Host {
  open = signal(false)
}

const content = () => document.querySelector('[data-slot="popover-content"]') as HTMLElement | null

afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')))

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const trigger = fixture.nativeElement.querySelector('#t') as HTMLButtonElement
  return { fixture, trigger }
}

describe('IvPopover', () => {
  it('opens on click with dialog role, side and ARIA links; two-way open', async () => {
    const { fixture, trigger } = await setup()
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    trigger.click()
    await fixture.whenStable()
    expect(fixture.componentInstance.open()).toBe(true)
    const c = content()!
    expect(c.getAttribute('role')).toBe('dialog')
    expect(c.dataset['side']).toBe('top')
    expect(c.classList).toContain('w-80')
    expect(trigger.getAttribute('aria-controls')).toBe(c.id)
    expect(trigger.dataset['state']).toBe('open')
    fixture.componentInstance.open.set(false)
    await fixture.whenStable()
    expect(content()).toBeNull()
  })

  it('moves focus in; Escape closes and returns focus to the trigger', async () => {
    const { fixture, trigger } = await setup()
    trigger.focus()
    trigger.click()
    await fixture.whenStable()
    await new Promise((r) => setTimeout(r))
    expect(content()!.contains(document.activeElement)).toBe(true)
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await fixture.whenStable()
    expect(fixture.componentInstance.open()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on an outside click', async () => {
    const { fixture, trigger } = await setup()
    trigger.click()
    await fixture.whenStable()
    ;(document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click()
    await fixture.whenStable()
    expect(fixture.componentInstance.open()).toBe(false)
  })

  it('has no axe violations', async () => {
    const { fixture, trigger } = await setup()
    trigger.click()
    await fixture.whenStable()
    await expect(content()!).toHaveNoViolations()
  })
})

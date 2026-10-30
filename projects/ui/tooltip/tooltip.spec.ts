import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Overlay } from '@angular/cdk/overlay'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { provideIvorie } from '@inlaylab/ivorie/core'
import { IV_TOOLTIP_DELAY, IV_TOOLTIP_IMPORTS } from './tooltip'

describe('IV_TOOLTIP_DELAY', () => {
  it('reads tooltipDelay from provideIvorie()', () => {
    TestBed.configureTestingModule({ providers: [provideIvorie({ tooltipDelay: 250 })] })
    expect(TestBed.inject(IV_TOOLTIP_DELAY)).toBe(250)
  })

  it('defaults to 0', () => {
    expect(TestBed.inject(IV_TOOLTIP_DELAY)).toBe(0)
  })
})

@Component({
  imports: [IV_TOOLTIP_IMPORTS],
  template: `
    <iv-tooltip [delayDuration]="delay()">
      <button ivTooltipTrigger>Hover me</button>
      <iv-tooltip-content class="extra" side="bottom">Add to library</iv-tooltip-content>
    </iv-tooltip>
  `,
})
class Host {
  delay = signal(300)
}

@Component({
  imports: [IV_TOOLTIP_IMPORTS],
  template: `
    <iv-tooltip [delayDuration]="0">
      <input ivTooltipTrigger aria-label="Email" aria-describedby="email-error" />
      <iv-tooltip-content>We never share it</iv-tooltip-content>
    </iv-tooltip>
    <p id="email-error">Required</p>
  `,
})
class DescribedHost {}

describe('IvTooltip trigger with its own aria-describedby', () => {
  it('keeps it, and adds the tooltip id while open', async () => {
    const fixture = TestBed.createComponent(DescribedHost)
    await fixture.whenStable()
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-describedby')).toBe('email-error')
    fixture.nativeElement.querySelector('iv-tooltip').dispatchEvent(new MouseEvent('mouseenter'))
    await fixture.whenStable()
    const tip = document.querySelector('[role="tooltip"]')!
    expect(input.getAttribute('aria-describedby')).toBe(`email-error ${tip.id}`)
  })
})

@Component({
  imports: [IV_TOOLTIP_IMPORTS],
  template: `
    <iv-tooltip [delayDuration]="0">
      <button ivTooltipTrigger>Save</button>
      <iv-tooltip-content [hidden]="true">Saves the file</iv-tooltip-content>
    </iv-tooltip>
  `,
})
class HiddenHost {}

describe('IvTooltip with hidden content', () => {
  it('opens nothing and never points aria-describedby at a missing id', async () => {
    const fixture = TestBed.createComponent(HiddenHost)
    await fixture.whenStable()
    fixture.nativeElement.querySelector('iv-tooltip').dispatchEvent(new MouseEvent('mouseenter'))
    await fixture.whenStable()
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('button').hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('IvTooltip', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  async function render() {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement
    // mouseenter does not bubble: the listener is on <iv-tooltip>, which wraps the trigger.
    const root = fixture.nativeElement.querySelector('iv-tooltip') as HTMLElement
    const settle = async (ms = 0) => {
      await vi.advanceTimersByTimeAsync(ms)
      fixture.detectChanges()
      await vi.advanceTimersByTimeAsync(0)
    }
    const tip = () => document.querySelector<HTMLElement>('[role="tooltip"]')
    return { fixture, trigger, root, settle, tip }
  }

  it('creates no overlay before the first hover', async () => {
    const create = vi.spyOn(TestBed.inject(Overlay), 'create')
    const { tip, settle, root } = await render()
    await settle(1000)
    expect(create).not.toHaveBeenCalled()
    expect(tip()).toBeNull()
  })

  it('hover opens after the delay and sets aria-describedby', async () => {
    const { trigger, settle, tip, root } = await render()
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(299)
    expect(tip()).toBeNull()
    await settle(1)
    const panel = tip()!
    expect(panel.textContent).toContain('Add to library')
    expect(panel.id).toBeTruthy()
    expect(trigger.getAttribute('aria-describedby')).toBe(panel.id)
  })

  it('panel has hooks, data attributes and no aria-live', async () => {
    const { trigger, settle, tip, root } = await render()
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    const panel = tip()!
    expect(panel.classList).toContain('cn-tooltip-content')
    expect(panel.classList).toContain('extra')
    expect(panel.dataset['state']).toBe('open')
    expect(panel.dataset['side']).toBe('bottom')
    expect(panel.hasAttribute('aria-live')).toBe(false)
    expect(panel.querySelector('.cn-tooltip-arrow')).not.toBeNull()
  })

  it('keyboard focus opens, blur closes', async () => {
    const { trigger, settle, tip, root } = await render()
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    await settle(300)
    expect(tip()).not.toBeNull()
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    await settle(100)
    expect(tip()).toBeNull()
  })

  it('pointer focus does not open it; mousedown closes it', async () => {
    const { trigger, settle, tip, root } = await render()
    trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    document.dispatchEvent(new MouseEvent('mouseup'))
    await settle(300)
    expect(tip()).toBeNull()
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    expect(tip()).not.toBeNull()
    trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await settle()
    expect(tip()).toBeNull()
  })

  it('Escape closes', async () => {
    const { trigger, settle, tip, root } = await render()
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(tip()).toBeNull()
  })

  it('leave closes after 100ms; re-enter inside that window keeps it open', async () => {
    const { trigger, settle, tip, root } = await render()
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    root.dispatchEvent(new MouseEvent('mouseleave'))
    await settle(50)
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(500)
    expect(tip()).not.toBeNull()
    root.dispatchEvent(new MouseEvent('mouseleave'))
    await settle(100)
    expect(tip()).toBeNull()
  })

  it('pointer on the panel keeps it open', async () => {
    const { trigger, settle, tip, root } = await render()
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    root.dispatchEvent(new MouseEvent('mouseleave'))
    tip()!.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(500)
    expect(tip()).not.toBeNull()
  })

  it('destroying the host mid-delay opens nothing', async () => {
    const { fixture, trigger, settle, tip, root } = await render()
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(100)
    fixture.destroy()
    await vi.advanceTimersByTimeAsync(1000)
    expect(tip()).toBeNull()
  })

  it('axe passes on the open tooltip', async () => {
    const { fixture, trigger, settle, root } = await render()
    root.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    vi.useRealTimers()
    await expect(fixture.nativeElement).toHaveNoViolations()
    await expect(document.querySelector('.cdk-overlay-container') as HTMLElement).toHaveNoViolations()
  })
})

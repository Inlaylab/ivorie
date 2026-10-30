import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Overlay } from '@angular/cdk/overlay'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IV_HOVER_CARD_IMPORTS } from './hover-card'

@Component({
  imports: [IV_HOVER_CARD_IMPORTS],
  template: `
    <iv-hover-card [openDelay]="openDelay()" [closeDelay]="closeDelay()">
      <a href="#" ivHoverCardTrigger>&#64;angular</a>
      <iv-hover-card-content class="w-80">The web framework.</iv-hover-card-content>
    </iv-hover-card>
  `,
})
class Host {
  openDelay = signal(300)
  closeDelay = signal(200)
}

describe('IvHoverCard', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  async function render() {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const trigger = fixture.nativeElement.querySelector('a') as HTMLAnchorElement
    const settle = async (ms = 0) => {
      await vi.advanceTimersByTimeAsync(ms)
      fixture.detectChanges()
      await vi.advanceTimersByTimeAsync(0)
    }
    const card = () => document.querySelector<HTMLElement>('[data-slot="hover-card-content"]')
    return { fixture, trigger, settle, card }
  }

  it('creates no overlay before the first trigger', async () => {
    const create = vi.spyOn(TestBed.inject(Overlay), 'create')
    const { settle, card, trigger } = await render()
    await settle(1000)
    expect(create).not.toHaveBeenCalled()
    expect(card()).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
  })

  it('hover opens after openDelay; leave closes after closeDelay', async () => {
    const { trigger, settle, card } = await render()
    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(299)
    expect(card()).toBeNull()
    await settle(1)
    expect(card()!.textContent).toContain('The web framework.')
    trigger.dispatchEvent(new MouseEvent('mouseleave'))
    await settle(199)
    expect(card()).not.toBeNull()
    await settle(1)
    expect(card()).toBeNull()
  })

  it('content has hook, user class, data attributes; trigger aria follows open state', async () => {
    const { trigger, settle, card } = await render()
    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    const el = card()!
    expect(el.classList).toContain('cn-hover-card-content')
    expect(el.classList).toContain('w-80')
    expect(el.dataset['state']).toBe('open')
    expect(el.dataset['side']).toBe('bottom')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(el.id)
  })

  it('pointer into the card cancels the close', async () => {
    const { trigger, settle, card } = await render()
    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    trigger.dispatchEvent(new MouseEvent('mouseleave'))
    await settle(100)
    card()!.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(1000)
    expect(card()).not.toBeNull()
  })

  it('focus opens, blur closes', async () => {
    const { trigger, settle, card } = await render()
    trigger.dispatchEvent(new FocusEvent('focus'))
    await settle(300)
    expect(card()).not.toBeNull()
    trigger.dispatchEvent(new FocusEvent('blur'))
    await settle(200)
    expect(card()).toBeNull()
  })

  it('Escape closes', async () => {
    const { trigger, settle, card } = await render()
    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(card()).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('delays follow the inputs', async () => {
    const { fixture, trigger, settle, card } = await render()
    fixture.componentInstance.openDelay.set(50)
    fixture.detectChanges()
    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(50)
    expect(card()).not.toBeNull()
  })

  it('destroying the host mid-delay is silent', async () => {
    const create = vi.spyOn(TestBed.inject(Overlay), 'create')
    const { fixture, trigger, card } = await render()
    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.advanceTimersByTimeAsync(100)
    fixture.destroy()
    await vi.advanceTimersByTimeAsync(1000)
    expect(create).not.toHaveBeenCalled()
    expect(card()).toBeNull()
  })

  it('axe passes on the open card', async () => {
    const { fixture, trigger, settle } = await render()
    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await settle(300)
    vi.useRealTimers()
    await expect(fixture.nativeElement).toHaveNoViolations()
    await expect(document.querySelector('.cdk-overlay-container') as HTMLElement).toHaveNoViolations()
  })
})

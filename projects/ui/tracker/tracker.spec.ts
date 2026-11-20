import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvTracker, type IvTrackerItem } from '@inlaylab/ivorie/tracker'

const DATA: IvTrackerItem[] = [
  { status: 'ok', tooltip: 'Nov 1: operational' },
  { status: 'warn', tooltip: 'Nov 2: degraded' },
  { status: 'error', tooltip: 'Nov 3: outage' },
  { status: 'none', tooltip: 'Nov 4: no data' },
]

@Component({
  imports: [IvTracker],
  template: `<iv-tracker [data]="data()" label="API uptime" />`,
})
class Host {
  data = signal(DATA)
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement.querySelector('[data-slot="tracker"]') as HTMLElement
  const bars = [...el.querySelectorAll<HTMLElement>('[data-slot="tracker-bar"]')]
  return { fixture, el, bars }
}

describe('IvTracker', () => {
  it('is a named group of bars, each named and colored by status', async () => {
    const { el, bars } = await setup()
    expect(el.getAttribute('role')).toBe('group')
    expect(el.getAttribute('aria-label')).toBe('API uptime')
    expect(bars.map((b) => b.dataset['status'])).toEqual(['ok', 'warn', 'error', 'none'])
    expect(bars.map((b) => b.getAttribute('aria-label'))).toEqual(DATA.map((d) => d.tooltip))
    await expect(el).toHaveNoViolations()
  })

  it('one tab stop (the last bar); arrows, Home and End move focus and show the tooltip', async () => {
    const { fixture, el, bars } = await setup()
    expect(bars.map((b) => b.tabIndex)).toEqual([-1, -1, -1, 0])
    bars[3].focus()
    await fixture.whenStable()
    expect(el.querySelector('[data-slot="tracker-tooltip"]')!.textContent!.trim()).toBe('Nov 4: no data')
    bars[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await fixture.whenStable()
    expect(document.activeElement).toBe(bars[2])
    expect(el.querySelector('[data-slot="tracker-tooltip"]')!.textContent!.trim()).toBe('Nov 3: outage')
    bars[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    await fixture.whenStable()
    expect(document.activeElement).toBe(bars[0])
    expect(bars.map((b) => b.tabIndex)).toEqual([0, -1, -1, -1])
  })

  it('data shrinks after a bar had focus: the last bar is the tab stop again', async () => {
    const { fixture, el, bars } = await setup()
    bars[3].focus()
    await fixture.whenStable()
    fixture.componentInstance.data.set(DATA.slice(0, 2))
    await fixture.whenStable()
    const now = [...el.querySelectorAll<HTMLElement>('[data-slot="tracker-bar"]')]
    expect(now.map((b) => b.tabIndex)).toEqual([-1, 0])
    fixture.componentInstance.data.set([])
    await fixture.whenStable()
    expect(el.querySelectorAll('[data-slot="tracker-bar"]').length).toBe(0)
  })

  it('new data clears a stale focus or hover: no tooltip shows without a bar under it', async () => {
    const { fixture, el, bars } = await setup()
    // The bar is removed with focus on it, so its blur may never fire.
    bars[3].dispatchEvent(new FocusEvent('focus'))
    await fixture.whenStable()
    fixture.componentInstance.data.set(DATA.slice(0, 2))
    await fixture.whenStable()
    fixture.componentInstance.data.set(DATA)
    await fixture.whenStable()
    expect(el.querySelector('[data-slot="tracker-tooltip"]')).toBeNull()
  })

  it('hover shows the tooltip; leaving the row hides it', async () => {
    const { fixture, el, bars } = await setup()
    bars[1].dispatchEvent(new PointerEvent('pointerenter'))
    await fixture.whenStable()
    expect(el.querySelector('[data-slot="tracker-tooltip"]')!.textContent!.trim()).toBe('Nov 2: degraded')
    el.dispatchEvent(new PointerEvent('pointerleave'))
    await fixture.whenStable()
    expect(el.querySelector('[data-slot="tracker-tooltip"]')).toBeNull()
  })
})

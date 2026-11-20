import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { DAYS, incidents, services } from './data'
import { Status01, meta } from './status-01'

async function render() {
  const fixture = TestBed.createComponent(Status01)
  await fixture.whenStable()
  return fixture.nativeElement as HTMLElement
}

describe('status-01', () => {
  it('has meta for the registry', () => {
    expect(meta.title).toBe('Status 01')
    expect(meta.description.length).toBeGreaterThan(10)
  })

  it('renders a labelled tracker per service, one bar per day', async () => {
    const el = await render()
    const trackers = el.querySelectorAll('iv-tracker')
    expect(trackers.length).toBe(services.length)
    expect(trackers[0].getAttribute('aria-label')).toBe(`API uptime, last ${DAYS} days`)
    expect(trackers[0].querySelectorAll('[data-slot="tracker-bar"]').length).toBe(DAYS)
    expect(trackers[0].querySelector('[data-slot="tracker-bar"]')!.getAttribute('aria-label')).toBe('Oct 25: operational')
  })

  it('the headline follows the worst service, the gauge shows overall uptime', async () => {
    const el = await render()
    expect(el.querySelector('[data-testid="headline"]')!.textContent).toContain('Some systems degraded')
    const gauge = el.querySelector('iv-gauge')!
    expect(gauge.getAttribute('role')).toBe('meter')
    expect(gauge.getAttribute('aria-valuetext')).toBe('99.9%')
  })

  it('lists incidents with their updates', async () => {
    const el = await render()
    const articles = el.querySelectorAll('app-status-01-incidents article')
    expect(articles.length).toBe(incidents.length)
    expect(articles[0].querySelectorAll('li').length).toBe(incidents[0].updates.length)
  })

  it('has no axe violations', async () => {
    await expect(await render()).toHaveNoViolations()
  })
})

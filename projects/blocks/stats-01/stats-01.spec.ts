import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { kpis } from './data'
import { Stats01, meta } from './stats-01'

async function render() {
  const fixture = TestBed.createComponent(Stats01)
  await fixture.whenStable()
  return fixture.nativeElement as HTMLElement
}

describe('stats-01', () => {
  it('has meta for the registry', () => {
    expect(meta.title).toBe('Stats 01')
    expect(meta.description.length).toBeGreaterThan(10)
  })

  it('renders one stat per KPI, with value, delta and sparkline', async () => {
    const el = await render()
    const stats = el.querySelectorAll('iv-stat')
    expect(stats.length).toBe(kpis.length)
    expect(stats[0].querySelector('iv-stat-label')!.textContent).toContain('Revenue')
    expect(stats[0].querySelector('iv-stat-value')!.textContent).toContain('$48,200')
    expect(stats[0].querySelectorAll('svg[data-slot="sparkline"] path').length).toBeGreaterThan(0)
  })

  it('lower response time reads as good', async () => {
    const el = await render()
    const latency = [...el.querySelectorAll('iv-stat')].find((s) => s.textContent!.includes('Response time'))!
    expect(latency.querySelector('iv-delta')!.getAttribute('data-tone')).toBe('good')
    const orders = [...el.querySelectorAll('iv-stat')].find((s) => s.textContent!.includes('Orders'))!
    expect(orders.querySelector('iv-delta')!.getAttribute('data-tone')).toBe('bad')
  })

  it('has no axe violations', async () => {
    await expect(await render()).toHaveNoViolations()
  })
})

import { describe, expect, it } from 'vitest'
import { describeSidebarBlock, renderBlock } from '../testing/sidebar-block'
import { Dashboard01, meta } from './dashboard-01'

/** Points in the first area's top line: a natural curve draws one `C` per segment. */
const points = (card: Element) =>
  (card.querySelector('path[data-slot="chart-area-stroke"]')!.getAttribute('d')!.match(/C/g)?.length ?? 0) + 1
const xTicks = (card: Element) =>
  [...card.querySelectorAll('[data-slot="chart-x-axis"] .iv-chart-tick text')].map((t) => t.textContent!.trim())

describeSidebarBlock({ name: 'dashboard-01', meta, page: Dashboard01, links: 17, active: { url: 'history', label: 'History' } })

describe('dashboard-01 content', () => {
  it('renders four stat cards', async () => {
    const { el } = await renderBlock(Dashboard01)
    expect(el.querySelectorAll('app-dashboard-01-section-cards iv-card').length).toBe(4)
  })

  it('the chart shows 90 days', async () => {
    const { el } = await renderBlock(Dashboard01)
    const card = el.querySelector('app-dashboard-01-chart-area-interactive')!
    expect(card.querySelectorAll('path[data-slot="chart-area"]').length).toBe(2)
    expect(points(card)).toBe(90)
    const ticks = xTicks(card)
    expect(ticks[0]).toMatch(/^Apr \d$/)
    expect(ticks.at(-1)).toBe('Jun 30')
  })

  it('the range toggle shows 7 days', async () => {
    const { el, fixture } = await renderBlock(Dashboard01)
    const card = el.querySelector('app-dashboard-01-chart-area-interactive')!
    card.querySelector<HTMLButtonElement>('iv-toggle-group button[value="7d"]')!.click()
    await fixture.whenStable()
    expect(points(card)).toBe(7)
    expect(xTicks(card).at(-1)).toBe('Jun 30')
  })

  it('the table sorts and pages', async () => {
    const { el, fixture } = await renderBlock(Dashboard01)
    const rows = () => [...el.querySelectorAll('app-dashboard-01-documents tbody tr')]
    const first = () => rows()[0].querySelectorAll('td')[1].textContent!.trim()
    expect(rows().length).toBe(10)
    expect(first()).toBe('Cover page')
    el.querySelector<HTMLButtonElement>('th[ivDataTableSort="header"] button')!.click()
    await fixture.whenStable()
    expect(first()).toBe('Adaptive Communication Protocols')
    el.querySelector<HTMLButtonElement>('button[aria-label="Go to next page"]')!.click()
    await fixture.whenStable()
    expect(el.querySelector('[data-slot="data-table-page"]')!.textContent!.trim()).toBe('Page 2 of 3')
  })
})

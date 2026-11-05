import { describe, expect, it } from 'vitest'
import { describeSidebarBlock, renderBlock } from '../testing/sidebar-block'
import { Dashboard01, meta } from './dashboard-01'

describeSidebarBlock({ name: 'dashboard-01', meta, page: Dashboard01, links: 17, active: { url: 'history', label: 'History' } })

describe('dashboard-01 content', () => {
  it('renders four stat cards', async () => {
    const { el } = await renderBlock(Dashboard01)
    expect(el.querySelectorAll('app-dashboard-01-section-cards iv-card').length).toBe(4)
  })

  it('the chart slot is a placeholder', async () => {
    const { el } = await renderBlock(Dashboard01)
    expect(el.querySelector('[data-testid="chart-slot"] iv-skeleton')).not.toBeNull()
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

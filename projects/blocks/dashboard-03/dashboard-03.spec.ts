import { describe, expect, it } from 'vitest'
import { describeSidebarBlock, renderBlock } from '../testing/sidebar-block'
import { Dashboard03, meta } from './dashboard-03'

describeSidebarBlock({ name: 'dashboard-03', meta, page: Dashboard03, links: 16, active: { url: 'orders', label: 'Orders' } })

describe('dashboard-03 content', () => {
  it('renders four stat cards', async () => {
    const { el } = await renderBlock(Dashboard03)
    expect(el.querySelectorAll('app-dashboard-03-section-cards iv-card').length).toBe(4)
  })

  it.each(['app-dashboard-03-chart-channels', 'app-dashboard-03-chart-goal', 'app-dashboard-03-chart-products'])(
    '%s renders its chart',
    async (card) => {
      const { el } = await renderBlock(Dashboard03)
      const root = el.querySelector(`${card} iv-card svg[data-slot="chart-surface"]`)
      expect(root).not.toBeNull()
      expect(root!.querySelectorAll('path[d]').length).toBeGreaterThan(0)
    },
  )

  it('the donut shows the total in its center', async () => {
    const { el } = await renderBlock(Dashboard03)
    const card = el.querySelector('app-dashboard-03-chart-channels')!
    expect(card.querySelectorAll('[data-slot="chart-pie-sector"]').length).toBe(5)
    expect(card.querySelector('svg text')!.textContent).toContain('$45,231')
  })

  it('lists the recent sales', async () => {
    const { el } = await renderBlock(Dashboard03)
    expect(el.querySelectorAll('app-dashboard-03-recent-sales li').length).toBe(5)
  })
})

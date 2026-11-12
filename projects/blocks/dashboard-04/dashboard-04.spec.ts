import { describe, expect, it } from 'vitest'
import { describeSidebarBlock, renderBlock } from '../testing/sidebar-block'
import { Dashboard04, meta } from './dashboard-04'

describeSidebarBlock({ name: 'dashboard-04', meta, page: Dashboard04, links: 14, active: { url: 'features', label: 'Features' } })

describe('dashboard-04 content', () => {
  it('renders four stat cards', async () => {
    const { el } = await renderBlock(Dashboard04)
    expect(el.querySelectorAll('app-dashboard-04-section-cards iv-card').length).toBe(4)
  })

  it.each([
    'app-dashboard-04-chart-active-users',
    'app-dashboard-04-chart-features',
    'app-dashboard-04-chart-seats',
    'app-dashboard-04-chart-seat-change',
  ])('%s renders its chart', async (card) => {
    const { el } = await renderBlock(Dashboard04)
    const root = el.querySelector(`${card} iv-card svg[data-slot="chart-surface"]`)
    expect(root).not.toBeNull()
    expect(root!.querySelectorAll('path[d]').length).toBeGreaterThan(0)
  })

  it('the seat change bars grow both ways from zero', async () => {
    const { el } = await renderBlock(Dashboard04)
    const fills = [...el.querySelectorAll('app-dashboard-04-chart-seat-change [data-slot="chart-bar"]')].map((b) => b.getAttribute('fill'))
    expect(fills).toContain('var(--color-gained)')
    expect(fills).toContain('var(--color-lost)')
  })
})

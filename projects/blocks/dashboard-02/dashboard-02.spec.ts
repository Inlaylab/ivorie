import { describe, expect, it } from 'vitest'
import { describeSidebarBlock, renderBlock } from '../testing/sidebar-block'
import { Dashboard02, meta } from './dashboard-02'

describeSidebarBlock({ name: 'dashboard-02', meta, page: Dashboard02, links: 21, active: { url: 'channels', label: 'Channels' } })

describe('dashboard-02 content', () => {
  it('renders four KPI cards', async () => {
    const { el } = await renderBlock(Dashboard02)
    expect(el.querySelectorAll('app-dashboard-02-section-cards iv-card').length).toBe(4)
  })

  it.each(['app-dashboard-02-chart-traffic', 'app-dashboard-02-chart-devices', 'app-dashboard-02-chart-conversions'])(
    '%s renders its chart',
    async (card) => {
      const { el } = await renderBlock(Dashboard02)
      const root = el.querySelector(`${card} iv-card svg[data-slot="chart-surface"]`)
      expect(root).not.toBeNull()
      expect(root!.querySelectorAll('path[d]').length).toBeGreaterThan(0)
    },
  )

  it('the traffic range toggle shows 30 days', async () => {
    const { el, fixture } = await renderBlock(Dashboard02)
    const card = el.querySelector('app-dashboard-02-chart-traffic')!
    const stroke = () => card.querySelector('path[data-slot="chart-area-stroke"]')!.getAttribute('d')!
    expect(stroke().match(/C/g)!.length + 1).toBe(90)
    card.querySelector<HTMLButtonElement>('iv-toggle-group button[value="30d"]')!.click()
    await fixture.whenStable()
    expect(stroke().match(/C/g)!.length + 1).toBe(30)
  })
})

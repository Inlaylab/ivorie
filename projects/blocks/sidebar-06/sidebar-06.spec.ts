import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar06, meta } from './sidebar-06'

describeSidebarBlock({ name: 'sidebar-06', meta, page: Sidebar06, links: 1 })

import { describe, expect, it } from 'vitest'
import { renderBlock } from '../testing/sidebar-block'

describe('sidebar-06 opt-in', () => {
  it('subscribing with an email thanks the user', async () => {
    const { el, fixture } = await renderBlock(Sidebar06)
    const input = el.querySelector<HTMLInputElement>('#sidebar-06-opt-in')!
    input.value = 'ada@example.com'
    input.dispatchEvent(new Event('input'))
    el.querySelector<HTMLButtonElement>('app-sidebar-06-opt-in-form button[type="submit"]')!.click()
    await fixture.whenStable()
    expect(el.querySelector('app-sidebar-06-opt-in-form [role="status"]')!.textContent).toContain('Thanks')
  })
})

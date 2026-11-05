// Shared spec for the sidebar and dashboard blocks: not a block, never shipped.
import { Component, Type } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { SIDEBAR_COOKIE_NAME } from '@inlaylab/ivorie/sidebar'
import { afterEach, describe, expect, it } from 'vitest'

@Component({ template: '' })
class Blank {}

export interface SidebarBlockSpec {
  name: string
  meta: { title: string; description: string }
  page: Type<unknown>
  /** Nav links rendered without opening anything (menus and collapsed groups excluded). */
  links: number
  /** The url (relative, from data.ts) to start at, and the label of the link that must be active there. */
  active?: { url: string; label: string }
}

export async function renderBlock(page: Type<unknown>, url = '/') {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] })
  await TestBed.inject(Router).navigateByUrl(url)
  const fixture = TestBed.createComponent(page)
  await fixture.whenStable()
  return { fixture, el: fixture.nativeElement as HTMLElement }
}

const LINKS = 'a[ivSidebarMenuButton][href], a[ivSidebarMenuSubButton][href]'

export function describeSidebarBlock(spec: SidebarBlockSpec): void {
  describe(spec.name, () => {
    // The sidebar saves its state in a cookie: clear it so one test cannot start another collapsed.
    afterEach(() => (document.cookie = `${SIDEBAR_COOKIE_NAME}=; max-age=0; path=/`))

    it('has meta for the registry', () => {
      expect(spec.meta.title.length).toBeGreaterThan(0)
      expect(spec.meta.description.length).toBeGreaterThan(10)
    })

    it('renders every nav link from data.ts', async () => {
      const { el } = await renderBlock(spec.page)
      expect(el.querySelectorAll(LINKS).length).toBe(spec.links)
    })

    if (spec.active) {
      const active = spec.active
      it('the active route marks its item', async () => {
        const { el } = await renderBlock(spec.page, '/' + active.url)
        const marked = [...el.querySelectorAll<HTMLElement>(LINKS)].filter((a) => a.hasAttribute('data-active'))
        expect(marked.map((a) => a.textContent!.trim())).toEqual([active.label])
        expect(marked[0].getAttribute('aria-current')).toBe('page')
      })
    }

    it('the trigger collapses the sidebar', async () => {
      const { el, fixture } = await renderBlock(spec.page)
      const sidebar = el.querySelector('[data-slot="sidebar"]')!
      expect(sidebar.getAttribute('data-state')).toBe('expanded')
      el.querySelector<HTMLButtonElement>('iv-sidebar-trigger button')!.click()
      await fixture.whenStable()
      expect(sidebar.getAttribute('data-state')).toBe('collapsed')
    })

    it('has no axe violations', async () => {
      const { el } = await renderBlock(spec.page)
      await expect(el).toHaveNoViolations()
    })
  })
}

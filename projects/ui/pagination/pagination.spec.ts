import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_PAGINATION_IMPORTS } from './pagination'

@Component({
  imports: [IV_PAGINATION_IMPORTS],
  template: `
    <nav ivPagination class="extra">
      <ul ivPaginationContent>
        <li ivPaginationItem><a ivPaginationPrevious href="#p"></a></li>
        <li ivPaginationItem><a ivPaginationLink href="#1">1</a></li>
        <li ivPaginationItem><a ivPaginationLink href="#2" [isActive]="true">2</a></li>
        <li ivPaginationItem><span ivPaginationEllipsis></span></li>
        <li ivPaginationItem><a ivPaginationNext href="#n" text="Forward"></a></li>
      </ul>
    </nav>
  `,
})
class Host {}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const q = (selector: string) => el.querySelector<HTMLElement>(selector)!
  return { fixture, el, q }
}

describe('IvPagination', () => {
  it('nav, content and item carry their slots and hooks', async () => {
    const { q } = await render()
    const nav = q('nav')
    expect(nav.getAttribute('aria-label')).toBe('pagination')
    expect(nav.classList).toContain('cn-pagination')
    expect(nav.classList).toContain('extra')
    expect(q('ul').classList).toContain('cn-pagination-content')
    expect(q('li').dataset['slot']).toBe('pagination-item')
  })

  it('active link: aria-current, data-active, outline button look', async () => {
    const { q } = await render()
    const active = q('a[href="#2"]')
    expect(active.getAttribute('aria-current')).toBe('page')
    expect(active.hasAttribute('data-active')).toBe(true)
    for (const hook of ['cn-pagination-link', 'cn-button', 'cn-button-variant-outline', 'cn-button-size-icon'])
      expect(active.classList).toContain(hook)
  })

  it('inactive link: ghost button, no aria-current', async () => {
    const { q } = await render()
    const link = q('a[href="#1"]')
    expect(link.hasAttribute('aria-current')).toBe(false)
    expect(link.hasAttribute('data-active')).toBe(false)
    expect(link.classList).toContain('cn-button-variant-ghost')
  })

  it('previous / next: labels, hooks, text spans, rtl-flipped chevrons', async () => {
    const { q } = await render()
    const prev = q('a[href="#p"]')
    const next = q('a[href="#n"]')
    expect(prev.getAttribute('aria-label')).toBe('Go to previous page')
    expect(next.getAttribute('aria-label')).toBe('Go to next page')
    expect(prev.classList).toContain('cn-pagination-previous')
    expect(next.classList).toContain('cn-pagination-next')
    expect(prev.querySelector('.cn-pagination-previous-text')!.textContent!.trim()).toBe('Previous')
    expect(next.querySelector('.cn-pagination-next-text')!.textContent!.trim()).toBe('Forward')
    expect(prev.querySelector('svg.cn-rtl-flip')).not.toBeNull()
    expect(next.querySelector('svg.cn-rtl-flip')).not.toBeNull()
  })

  it('ellipsis is hidden from assistive tech with sr-only text', async () => {
    const { q } = await render()
    const ellipsis = q('[data-slot="pagination-ellipsis"]')
    expect(ellipsis.getAttribute('aria-hidden')).toBe('true')
    expect(ellipsis.classList).toContain('cn-pagination-ellipsis')
    expect(ellipsis.querySelector('.sr-only')!.textContent).toBe('More pages')
  })

  it('axe passes', async () => {
    const { fixture } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

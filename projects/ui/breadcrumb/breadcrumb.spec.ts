import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_BREADCRUMB_IMPORTS } from './breadcrumb'

@Component({
  imports: [IV_BREADCRUMB_IMPORTS],
  template: `
    <nav ivBreadcrumb class="extra">
      <ol ivBreadcrumbList>
        <li ivBreadcrumbItem><a ivBreadcrumbLink href="/">Home</a></li>
        <li ivBreadcrumbSeparator></li>
        <li ivBreadcrumbItem><span ivBreadcrumbEllipsis></span></li>
        <li ivBreadcrumbSeparator [showDefault]="false">/</li>
        <li ivBreadcrumbItem><span ivBreadcrumbPage>Settings</span></li>
      </ol>
    </nav>
  `,
})
class Host {}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const all = (slot: string) => Array.from(el.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`))
  return { fixture, el, all }
}

describe('IvBreadcrumb', () => {
  it('every part has its hook', async () => {
    const { all } = await render()
    for (const part of ['breadcrumb', 'breadcrumb-list', 'breadcrumb-item', 'breadcrumb-link', 'breadcrumb-page', 'breadcrumb-separator', 'breadcrumb-ellipsis'])
      expect(all(part)[0].classList).toContain(`cn-${part}`)
    expect(all('breadcrumb')[0].classList).toContain('extra')
    expect(all('breadcrumb')[0].getAttribute('aria-label')).toBe('breadcrumb')
  })

  it('current page is a disabled link with aria-current', async () => {
    const { all } = await render()
    const page = all('breadcrumb-page')[0]
    expect(page.getAttribute('role')).toBe('link')
    expect(page.getAttribute('aria-disabled')).toBe('true')
    expect(page.getAttribute('aria-current')).toBe('page')
  })

  it('separator: default rtl-flipped chevron, or projected content only', async () => {
    const { all } = await render()
    const [chevron, slash] = all('breadcrumb-separator')
    expect(chevron.getAttribute('role')).toBe('presentation')
    expect(chevron.getAttribute('aria-hidden')).toBe('true')
    expect(chevron.querySelector('svg.cn-rtl-flip')).not.toBeNull()
    expect(slash.querySelector('svg')).toBeNull()
    expect(slash.textContent!.trim()).toBe('/')
  })

  it('ellipsis has sr-only text', async () => {
    const { all } = await render()
    expect(all('breadcrumb-ellipsis')[0].querySelector('.sr-only')!.textContent).toBe('More')
  })

  it('axe passes on a 3-level trail', async () => {
    const { fixture } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

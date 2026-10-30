import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_SCROLL_AREA_IMPORTS } from './scroll-area'

@Component({
  imports: [IV_SCROLL_AREA_IMPORTS],
  template: `
    <iv-scroll-area [type]="type()" maxHeight="120px" class="extra" aria-label="Tags">
      @for (n of rows; track n) {
        <p>Row {{ n }}</p>
      }
    </iv-scroll-area>
  `,
})
class Host {
  type = signal<'auto' | 'always' | 'scroll-x' | 'scroll-y'>('auto')
  rows = Array.from({ length: 30 }, (_, i) => i)
}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const root = fixture.nativeElement.querySelector('iv-scroll-area') as HTMLElement
  const viewport = root.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!
  return { fixture, host: fixture.componentInstance, root, viewport }
}

describe('IvScrollArea', () => {
  it('hooks on root and viewport; user class on the root', async () => {
    const { root, viewport } = await render()
    expect(root.dataset['slot']).toBe('scroll-area')
    expect(root.classList).toContain('cn-scroll-area')
    expect(root.classList).toContain('extra')
    expect(viewport.classList).toContain('cn-scroll-area-viewport')
  })

  it('type maps to the overflow utility', async () => {
    const { fixture, host, viewport } = await render()
    expect(viewport.classList).toContain('overflow-auto')
    host.type.set('scroll-y')
    await fixture.whenStable()
    expect(viewport.classList).toContain('overflow-y-auto')
    expect(viewport.classList).not.toContain('overflow-auto')
  })

  it('maxHeight lands on the viewport, which is keyboard focusable', async () => {
    const { viewport } = await render()
    expect(viewport.style.maxHeight).toBe('120px')
    expect(viewport.getAttribute('tabindex')).toBe('0')
  })

  it('axe passes with overflowing content', async () => {
    const { fixture } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

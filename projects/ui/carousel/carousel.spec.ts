import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import { IV_CAROUSEL_IMPORTS } from '@inlaylab/ivorie/carousel'

@Component({
  imports: [IV_CAROUSEL_IMPORTS],
  template: `
    <iv-carousel class="w-64" aria-label="Photos">
      <iv-carousel-content>
        @for (n of [1, 2, 3]; track n) {
          <iv-carousel-item>Slide {{ n }}</iv-carousel-item>
        }
      </iv-carousel-content>
      <button ivCarouselPrevious></button>
      <button ivCarouselNext></button>
    </iv-carousel>
  `,
})
class Host {}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const root = el.querySelector('iv-carousel') as HTMLElement
  const viewport = el.querySelector('[data-slot="carousel-content"]')!.parentElement as HTMLElement
  const prev = el.querySelector('[data-slot="carousel-previous"]') as HTMLButtonElement
  const next = el.querySelector('[data-slot="carousel-next"]') as HTMLButtonElement
  // jsdom has no layout: fake a 3-slide track, 200px wide.
  Object.defineProperties(viewport, {
    clientWidth: { value: 200 },
    scrollWidth: { value: 600 },
    scrollLeft: { value: 0, writable: true },
  })
  viewport.scrollBy = vi.fn()
  const scrollTo = async (x: number) => {
    viewport.scrollLeft = x
    viewport.dispatchEvent(new Event('scroll'))
    await fixture.whenStable()
  }
  return { fixture, el, root, viewport, prev, next, scrollTo }
}

describe('IvCarousel', () => {
  it('has carousel and slide roles; buttons have names and the button look', async () => {
    const { el, root, prev, next } = await setup()
    expect(root.getAttribute('role')).toBe('region')
    expect(root.getAttribute('aria-roledescription')).toBe('carousel')
    const items = el.querySelectorAll('[aria-roledescription="slide"]')
    expect(items.length).toBe(3)
    expect(prev.textContent).toContain('Previous slide')
    expect(next.classList).toContain('cn-carousel-next')
    expect(next.classList).toContain('cn-button-variant-outline')
  })

  it('buttons enable by scroll position and scroll one viewport', async () => {
    const { prev, next, viewport, scrollTo } = await setup()
    await scrollTo(0)
    expect(prev.disabled).toBe(true)
    expect(next.disabled).toBe(false)
    next.click()
    expect(viewport.scrollBy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' })
    await scrollTo(400)
    expect(prev.disabled).toBe(false)
    expect(next.disabled).toBe(true)
  })

  it('arrow keys scroll', async () => {
    const { root, viewport } = await setup()
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(viewport.scrollBy).toHaveBeenCalledWith({ left: -200, behavior: 'smooth' })
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

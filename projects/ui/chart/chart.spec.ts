import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IV_CHART, IvChart, IvChartConfig } from '@inlaylab/ivorie/chart'
import { ivSeriesLabel } from './types'

@Component({
  imports: [IvChart],
  template: `<iv-chart [config]="config()" class="w-96"></iv-chart>`,
})
class Host {
  config = signal<IvChartConfig>({})
}

async function setup(config: IvChartConfig) {
  const fixture = TestBed.createComponent(Host)
  fixture.componentInstance.config.set(config)
  await fixture.whenStable()
  const el = fixture.nativeElement.querySelector('[data-slot="chart"]') as HTMLElement
  const debug = fixture.debugElement.children[0]
  return { fixture, el, context: debug.injector.get(IV_CHART) }
}

type Callback = (entries: { contentRect: { width: number; height: number } }[]) => void

function stubResizeObserver() {
  const state: { callback?: Callback; disconnected: boolean } = { disconnected: false }
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: Callback) {
        state.callback = cb
      }
      observe() {}
      unobserve() {}
      disconnect() {
        state.disconnected = true
      }
    },
  )
  return state
}

describe('IvChart', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('writes --color-<key> for color series', async () => {
    const { el } = await setup({ desktop: { label: 'Desktop', color: 'var(--chart-1)' } })
    expect(el.style.getPropertyValue('--color-desktop')).toBe('var(--chart-1)')
    expect(el.dataset['slot']).toBe('chart')
    expect(el.classList).toContain('cn-chart')
    expect(el.classList).toContain('w-96')
    expect(el.dataset['chart']).toMatch(/^chart-/)
    expect(el.querySelector('style')).toBeNull()
  })

  it('adds a scoped style for theme series', async () => {
    const { el, context } = await setup({ a: { theme: { light: 'red', dark: 'blue' } } })
    const styles = el.querySelectorAll('style')
    expect(styles.length).toBe(1)
    const css = styles[0].textContent ?? ''
    expect(css).toContain(`[data-chart=${context.id}] {`)
    expect(css).toContain('--color-a: red;')
    expect(css).toContain(`.dark [data-chart=${context.id}] {`)
    expect(css).toContain('--color-a: blue;')
    expect(el.dataset['chart']).toBe(context.id)
  })

  it('removes the style when no series uses a theme', async () => {
    const { fixture, el } = await setup({ a: { theme: { light: 'red', dark: 'blue' } } })
    fixture.componentInstance.config.set({ a: { color: 'red' } })
    await fixture.whenStable()
    expect(el.querySelector('style')).toBeNull()
    expect(el.style.getPropertyValue('--color-a')).toBe('red')
  })

  it('reuses a server-rendered style instead of adding a second one', async () => {
    const fixture = TestBed.createComponent(Host)
    const host = fixture.nativeElement.querySelector('iv-chart') as HTMLElement | null
    // Seed before the first change detection, like server markup on the client.
    const seeded = document.createElement('style')
    seeded.setAttribute('data-chart-style', '')
    seeded.textContent = '[data-chart=old] {}'
    const target = (host ?? fixture.nativeElement) as HTMLElement
    target.appendChild(seeded)
    fixture.componentInstance.config.set({ a: { theme: { light: 'red', dark: 'blue' } } })
    await fixture.whenStable()
    const el = fixture.nativeElement.querySelector('[data-slot="chart"]') as HTMLElement
    expect(el.querySelectorAll('style').length).toBe(1)
    expect(el.querySelector('style')).toBe(seeded)
    expect(seeded.textContent).toContain('--color-a: red;')
    fixture.componentInstance.config.set({ a: { theme: { light: 'green', dark: 'blue' } } })
    await fixture.whenStable()
    expect(el.querySelectorAll('style').length).toBe(1)
    expect(seeded.textContent).toContain('--color-a: green;')
    fixture.componentInstance.config.set({})
    await fixture.whenStable()
    expect(el.querySelector('style')).toBeNull()
  })

  it('missing key falls back to the key', () => {
    expect(ivSeriesLabel({}, 'visits')).toBe('visits')
    expect(ivSeriesLabel({ visits: { label: 'Visits' } }, 'visits')).toBe('Visits')
  })

  it('starts at initialDimension', async () => {
    const { context } = await setup({})
    expect(context.size()).toEqual({ width: 320, height: 200 })
  })

  it('follows the container size and ignores width 0', async () => {
    const ro = stubResizeObserver()
    const { fixture, context } = await setup({})
    ro.callback?.([{ contentRect: { width: 500, height: 250 } }])
    expect(context.size()).toEqual({ width: 500, height: 250 })
    ro.callback?.([{ contentRect: { width: 0, height: 0 } }])
    expect(context.size()).toEqual({ width: 500, height: 250 })
    ro.callback?.([{ contentRect: { width: 300, height: 150 } }])
    expect(context.size()).toEqual({ width: 300, height: 150 })
    fixture.destroy()
    expect(ro.disconnected).toBe(true)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup({ a: { label: 'A', color: 'red' } })
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

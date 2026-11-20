import { Component, signal } from '@angular/core'
import { IvIdGenerator } from '@inlaylab/ivorie/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvMeter } from '@inlaylab/ivorie/meter'

@Component({
  imports: [IvMeter],
  template: `<iv-meter [value]="value()" [max]="200" [low]="low()" [high]="high()" [optimum]="optimum()" [ticks]="ticks()" label="Storage" valueText="68 GB of 200 GB" />`,
})
class Host {
  value = signal(68)
  low = signal<number | undefined>(undefined)
  high = signal<number | undefined>(undefined)
  optimum = signal<number | undefined>(undefined)
  ticks = signal(20)
}

async function setup(patch: Partial<{ value: number; low: number; high: number; optimum: number; ticks: number }> = {}) {
  const fixture = TestBed.createComponent(Host)
  const host = fixture.componentInstance
  for (const [k, v] of Object.entries(patch)) (host as any)[k].set(v)
  await fixture.whenStable()
  const el = fixture.nativeElement.querySelector('[data-slot="meter"]') as HTMLElement
  const track = el.querySelector('[role="meter"]') as HTMLElement
  return { fixture, el, track }
}

describe('IvMeter', () => {
  it('is a named meter with its range, value and two labels', async () => {
    const { el, track } = await setup()
    expect(track.getAttribute('aria-valuemin')).toBe('0')
    expect(track.getAttribute('aria-valuemax')).toBe('200')
    expect(track.getAttribute('aria-valuenow')).toBe('68')
    expect(track.getAttribute('aria-valuetext')).toBe('68 GB of 200 GB')
    const label = el.querySelector('[data-slot="meter-label"]')!
    expect(label.textContent!.trim()).toBe('Storage')
    expect(track.getAttribute('aria-labelledby')).toBe(label.id)
    expect(el.querySelector('[data-slot="meter-value"]')!.textContent!.trim()).toBe('68 GB of 200 GB')
    await expect(el).toHaveNoViolations()
  })

  it('fills the ticks up to the value, clamped to the range', async () => {
    const filled = async (value: number) => {
      const { el } = await setup({ value })
      return el.querySelectorAll('[data-slot="meter-tick"][data-filled]').length
    }
    expect(await filled(68)).toBe(7) // 68 / 200 of 20 ticks
    expect(await filled(500)).toBe(20)
    expect(await filled(-3)).toBe(0)
  })

  it('ticks="0" draws one solid bar', async () => {
    const { el } = await setup({ ticks: 0, value: 50 })
    expect(el.querySelectorAll('[data-slot="meter-tick"]').length).toBe(0)
    expect((el.querySelector('[data-slot="meter-fill"]') as HTMLElement).style.width).toBe('25%')
  })

  it('status follows low, high and optimum like the HTML meter', async () => {
    expect((await setup()).el.dataset['status']).toBeUndefined()
    // Optimum low (less is better): high usage is bad, the middle is a warning.
    expect((await setup({ low: 100, high: 160, optimum: 0, value: 40 })).el.dataset['status']).toBe('good')
    expect((await setup({ low: 100, high: 160, optimum: 0, value: 130 })).el.dataset['status']).toBe('warn')
    expect((await setup({ low: 100, high: 160, optimum: 0, value: 190 })).el.dataset['status']).toBe('bad')
    // No optimum: the middle part is good.
    expect((await setup({ low: 100, high: 160, value: 130 })).el.dataset['status']).toBe('good')
  })

  it('low and high as static strings work like numbers (no "20" + "80")', async () => {
    TestBed.overrideTemplate(Host, `<iv-meter value="50" low="20" high="80" label="Storage" />`)
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelector('[data-slot="meter"]').dataset['status']).toBe('good')
  })

  it('label ids come from IvIdGenerator, so prerendered HTML is stable per request', async () => {
    const { el } = await setup()
    const id = el.querySelector('[data-slot="meter-label"]')!.id
    expect(id).toMatch(/^iv-meter-label-\d+$/)
    expect(TestBed.inject(IvIdGenerator).next('iv-meter-label')).toBe(`iv-meter-label-${Number(id.split('-').at(-1)) + 1}`)
  })
})

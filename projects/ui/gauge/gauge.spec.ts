import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvGauge, type IvGaugeShape } from '@inlaylab/ivorie/gauge'

@Component({
  imports: [IvGauge],
  template: `<iv-gauge [value]="value()" [shape]="shape()" [segments]="segments()" label="Uptime" caption="Last 30 days" [valueText]="text()" />`,
})
class Host {
  value = signal(72)
  shape = signal<IvGaugeShape>('radial')
  segments = signal<number | undefined>(undefined)
  text = signal('')
}

async function setup(patch: Partial<{ value: number; shape: IvGaugeShape; segments: number; text: string }> = {}) {
  const fixture = TestBed.createComponent(Host)
  for (const [k, v] of Object.entries(patch)) (fixture.componentInstance as any)[k].set(v)
  await fixture.whenStable()
  return fixture.nativeElement.querySelector('[data-slot="gauge"]') as HTMLElement
}

describe('IvGauge', () => {
  it('is a named meter with the value in the middle of a 24-segment ring, its range at the ends', async () => {
    const el = await setup()
    expect(el.getAttribute('role')).toBe('meter')
    expect(el.getAttribute('aria-label')).toBe('Uptime')
    expect(el.getAttribute('aria-valuenow')).toBe('72')
    expect(el.getAttribute('aria-valuetext')).toBe('72%')
    expect(el.dataset['shape']).toBe('radial')
    expect(el.querySelectorAll('path[data-slot="gauge-segment"]').length).toBe(24)
    expect(el.querySelectorAll('[data-slot="gauge-segment"][data-filled]').length).toBe(17)
    expect([...el.querySelectorAll('[data-slot="gauge-scale"]')].map((s) => s.textContent!.trim())).toEqual(['0', '100'])
    expect(el.querySelector('[data-slot="gauge-value"]')!.textContent!.trim()).toBe('72%')
    expect(el.querySelector('[data-slot="gauge-caption"]')!.textContent!.trim()).toBe('Last 30 days')
    await expect(el).toHaveNoViolations()
  })

  it('capsule: a row of capsules, value text as given', async () => {
    const el = await setup({ shape: 'capsule', segments: 8, value: 50, text: '4 of 8' })
    const caps = el.querySelectorAll('span[data-slot="gauge-segment"]')
    expect(caps.length).toBe(8)
    expect(el.querySelectorAll('[data-slot="gauge-segment"][data-filled]').length).toBe(4)
    expect(el.getAttribute('aria-valuetext')).toBe('4 of 8')
    await expect(el).toHaveNoViolations()
  })

  it('clamps to the range', async () => {
    expect((await setup({ value: 140 })).getAttribute('aria-valuenow')).toBe('100')
    expect((await setup({ value: -2 })).querySelectorAll('[data-filled]').length).toBe(0)
  })

  it('one segment draws the whole 270° ring (large-arc flag), not a short arc', async () => {
    const el = await setup({ segments: 1, value: 50 })
    expect(el.querySelector('[data-slot="gauge-segment"]')!.getAttribute('d')).toMatch(/ A 42 42 0 1 1 /)
  })

  it('segments as a static string is a number', async () => {
    TestBed.overrideTemplate(Host, `<iv-gauge value="50" segments="8" label="Uptime" />`)
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelectorAll('[data-slot="gauge-segment"]').length).toBe(8)
  })
})

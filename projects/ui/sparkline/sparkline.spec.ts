import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvSparkline } from '@inlaylab/ivorie/sparkline'

@Component({
  imports: [IvSparkline],
  template: `<svg ivSparkline [data]="data()" [type]="type()" [label]="label()"></svg>`,
})
class Host {
  data = signal([4, 8, 6, 10])
  type = signal<'line' | 'area'>('line')
  label = signal('')
}

async function setup(patch: Partial<{ data: number[]; type: 'line' | 'area'; label: string }> = {}) {
  const fixture = TestBed.createComponent(Host)
  for (const [k, v] of Object.entries(patch)) (fixture.componentInstance as any)[k].set(v)
  await fixture.whenStable()
  return fixture.nativeElement.querySelector('svg[data-slot="sparkline"]') as SVGSVGElement
}

describe('IvSparkline', () => {
  it('draws the points across the box, lowest at the bottom, highest at the top; hidden from screen readers', async () => {
    const svg = await setup()
    expect(svg.getAttribute('viewBox')).toBe('0 0 100 32')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    const d = svg.querySelector('[data-slot="sparkline-line"]')!.getAttribute('d')
    expect(d).toBe('M0.00 30.00 L33.33 11.33 L66.67 20.67 L100.00 2.00')
    expect(svg.querySelector('[data-slot="sparkline-area"]')).toBeNull()
  })

  it('area adds a filled shape; a label makes it a named image', async () => {
    const svg = await setup({ type: 'area', label: 'Revenue, rising' })
    expect(svg.querySelector('[data-slot="sparkline-area"]')!.getAttribute('d')).toMatch(/L100 32 L0 32 Z$/)
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('Revenue, rising')
    expect(svg.hasAttribute('aria-hidden')).toBe(false)
    await expect(svg as unknown as Element).toHaveNoViolations()
  })

  it('fewer than two points draws nothing; a flat line stays inside the box', async () => {
    expect((await setup({ data: [5] })).querySelector('path')).toBeNull()
    const flat = (await setup({ data: [3, 3, 3] })).querySelector('[data-slot="sparkline-line"]')!.getAttribute('d')
    expect(flat).toBe('M0.00 30.00 L50.00 30.00 L100.00 30.00')
  })
})

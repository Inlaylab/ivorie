import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { ICONS, IconName, IconNode, IvIcon } from '@inlaylab/ivorie/icon'

@Component({
  imports: [IvIcon],
  template: `<button type="button" aria-label="Open"><svg [ivIcon]="name()" class="size-4" [size]="size()"></svg></button>`,
})
class Host {
  name = signal<IconName | IconNode>('chevron-down')
  size = signal(24)
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const svg = () => fixture.nativeElement.querySelector('svg') as SVGSVGElement
  return { fixture, svg }
}

describe('IvIcon', () => {
  it('draws the shape with the Lucide attributes, hidden from screen readers', async () => {
    const { svg } = await setup()
    expect(svg().getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg().getAttribute('stroke')).toBe('currentColor')
    expect(svg().getAttribute('stroke-width')).toBe('2')
    expect(svg().getAttribute('fill')).toBe('none')
    expect(svg().getAttribute('aria-hidden')).toBe('true')
    expect(svg().getAttribute('width')).toBe('24')
    expect(svg().classList).toContain('size-4')
    expect(svg().getAttribute('data-icon')).toBe('chevron-down')
    const path = svg().querySelector('path')!
    expect(path.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(path.getAttribute('d')).toBe('m6 9 6 6 6-6')
  })

  it('switches shape and size; draws circles, lines and rects', async () => {
    const { fixture, svg } = await setup()
    fixture.componentInstance.name.set('circle-alert')
    fixture.componentInstance.size.set(16)
    await fixture.whenStable()
    expect(svg().getAttribute('width')).toBe('16')
    expect(svg().querySelector('circle')!.getAttribute('r')).toBe('10')
    expect(svg().querySelectorAll('line').length).toBe(2)
    fixture.componentInstance.name.set('panel-left')
    await fixture.whenStable()
    expect(svg().querySelector('rect')!.getAttribute('rx')).toBe('2')
  })

  it("draws any Lucide shape: the lucide package's IconNode type fits as is", async () => {
    // The type the `lucide` package exports for every icon.
    type LucideIconNode = [tag: string, attrs: Record<string, string | number | undefined>][]
    const house: LucideIconNode = [
      ['polyline', { points: '9 22 9 12 15 12 15 22', key: 'e2us08' }],
      ['ellipse', { cx: 12, cy: 5, rx: 9, ry: 3 }],
      ['path', { d: 'M3 9l9-7 9 7', fill: 'currentColor', onload: 'alert(1)', href: 'x' }],
    ]
    const { fixture, svg } = await setup()
    fixture.componentInstance.name.set(house)
    await fixture.whenStable()
    expect(svg().hasAttribute('data-icon')).toBe(false)
    expect(svg().querySelector('polyline')!.getAttribute('points')).toBe('9 22 9 12 15 12 15 22')
    expect(svg().querySelector('polyline')!.hasAttribute('key')).toBe(false)
    expect(svg().querySelector('ellipse')!.getAttribute('rx')).toBe('9')
    const path = svg().querySelector('path')!
    expect(path.getAttribute('fill')).toBe('currentColor')
    expect(path.hasAttribute('onload')).toBe(false)
    expect(path.hasAttribute('href')).toBe(false)
  })

  it('a new icon drops the old shapes and their attributes', async () => {
    const { fixture, svg } = await setup()
    fixture.componentInstance.name.set([['path', { d: 'M1 1', fill: 'red' }]])
    await fixture.whenStable()
    fixture.componentInstance.name.set([['path', { d: 'M2 2' }]])
    await fixture.whenStable()
    expect(svg().querySelectorAll('path').length).toBe(1)
    expect(svg().querySelector('path')!.hasAttribute('fill')).toBe(false)
  })

  it('every icon has at least one shape', () => {
    for (const [name, node] of Object.entries(ICONS)) expect(node.length, name).toBeGreaterThan(0)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { ICONS, IconName, IvIcon } from '@inlaylab/ivorie/icon'

@Component({
  imports: [IvIcon],
  template: `<button type="button" aria-label="Open"><svg [ivIcon]="name()" class="size-4" [size]="size()"></svg></button>`,
})
class Host {
  name = signal<IconName>('chevron-down')
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

  it('every icon has at least one shape', () => {
    for (const [name, node] of Object.entries(ICONS)) expect(node.length, name).toBeGreaterThan(0)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

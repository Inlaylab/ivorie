import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { ICONS, IconData, IconName, IconNode, IconSet, IconSvg, IvIcon, provideIvIcons } from '@inlaylab/ivorie/icon'

const FILL_SVG: IconSvg = { viewBox: '0 0 256 256', fill: 'currentColor' }

@Component({
  imports: [IvIcon],
  template: `<button type="button" aria-label="Open"><svg [ivIcon]="name()" class="size-4" [size]="size()"></svg></button>`,
})
class Host {
  name = signal<IconName | IconData | IconNode>('chevron-down')
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

  it('draws IconData with its own svg attributes', async () => {
    const { fixture, svg } = await setup()
    fixture.componentInstance.name.set({ svg: FILL_SVG, nodes: [['path', { d: 'M0 0h256' }]] })
    await fixture.whenStable()
    expect(svg().getAttribute('viewBox')).toBe('0 0 256 256')
    expect(svg().getAttribute('fill')).toBe('currentColor')
    expect(svg().hasAttribute('stroke')).toBe(false)
    expect(svg().hasAttribute('stroke-width')).toBe(false)
    expect(svg().querySelector('path')!.getAttribute('d')).toBe('M0 0h256')
  })

  it('every icon has at least one shape', () => {
    for (const [name, node] of Object.entries(ICONS)) expect(node.length, name).toBeGreaterThan(0)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

describe('provideIvIcons', () => {
  const fillSet = Object.fromEntries(
    Object.keys(ICONS).map((name) => [name, { svg: FILL_SVG, nodes: [['path', { d: `M0 0 ${name}` }], ['circle', { cx: 8, cy: 8, r: 4, fill: 'none', stroke: 'currentColor' }]] }]),
  ) as unknown as IconSet

  async function provided() {
    TestBed.configureTestingModule({ providers: [provideIvIcons(fillSet)] })
    return setup()
  }

  it('named icons come from the provided set, with its svg attributes', async () => {
    const { svg } = await provided()
    expect(svg().getAttribute('viewBox')).toBe('0 0 256 256')
    expect(svg().getAttribute('fill')).toBe('currentColor')
    expect(svg().hasAttribute('stroke')).toBe(false)
    expect(svg().getAttribute('data-icon')).toBe('chevron-down')
    expect(svg().querySelector('path')!.getAttribute('d')).toBe('M0 0 chevron-down')
  })

  it("a shape's own fill and stroke win over the svg attributes", async () => {
    const { svg } = await provided()
    const circle = svg().querySelector('circle')!
    expect(circle.getAttribute('fill')).toBe('none')
    expect(circle.getAttribute('stroke')).toBe('currentColor')
  })

  it('a raw Lucide IconNode keeps the Lucide stroke under a fill set', async () => {
    const { fixture, svg } = await provided()
    fixture.componentInstance.name.set([['path', { d: 'M1 1' }]])
    await fixture.whenStable()
    expect(svg().getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg().getAttribute('fill')).toBe('none')
    expect(svg().getAttribute('stroke')).toBe('currentColor')
    expect(svg().getAttribute('stroke-width')).toBe('2')
  })

  it('a component providers array scopes the set', async () => {
    @Component({ selector: 'iv-scoped', imports: [IvIcon], providers: [provideIvIcons(fillSet)], template: `<svg ivIcon="x"></svg>` })
    class Scoped {}
    @Component({ imports: [IvIcon, Scoped], template: `<svg ivIcon="x" id="outer"></svg><iv-scoped />` })
    class Page {}
    const fixture = TestBed.createComponent(Page)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('#outer')!.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(el.querySelector('iv-scoped svg')!.getAttribute('viewBox')).toBe('0 0 256 256')
  })
})

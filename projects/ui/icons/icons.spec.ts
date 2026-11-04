import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { ICONS, IconName, IconSet, IvIcon, provideIvIcons } from '@inlaylab/ivorie/icon'
import { COMPONENT_ICONS as HUGEICONS } from '@inlaylab/ivorie/icons/hugeicons'
import { COMPONENT_ICONS as PHOSPHOR } from '@inlaylab/ivorie/icons/phosphor'
import { COMPONENT_ICONS as REMIX } from '@inlaylab/ivorie/icons/remix'
import { COMPONENT_ICONS as TABLER } from '@inlaylab/ivorie/icons/tabler'

const NAMES = Object.keys(ICONS) as IconName[]

@Component({
  imports: [IvIcon],
  template: `@for (name of names; track name) { <svg [ivIcon]="name"></svg> }`,
})
class Host {
  names = NAMES
}

describe.each([
  ['tabler', TABLER],
  ['phosphor', PHOSPHOR],
  ['hugeicons', HUGEICONS],
  ['remix', REMIX],
] as [string, IconSet][])('icons/%s', (_, set) => {
  it('has every component icon', () => {
    expect(Object.keys(set).sort()).toEqual([...NAMES].sort())
  })

  it('draws every component icon with its own shapes', async () => {
    TestBed.configureTestingModule({ providers: [provideIvIcons(set)] })
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const svgs = [...fixture.nativeElement.querySelectorAll('svg')] as SVGSVGElement[]
    expect(svgs.length).toBe(NAMES.length)
    for (const [i, svg] of svgs.entries()) {
      expect(svg.getAttribute('viewBox'), NAMES[i]).toBe(set[NAMES[i]].svg.viewBox)
      expect(svg.children.length, NAMES[i]).toBeGreaterThan(0)
    }
  })
})

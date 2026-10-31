import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_KBD_IMPORTS } from '@inlaylab/ivorie/kbd'

@Component({
  imports: [IV_KBD_IMPORTS],
  template: `<kbd ivKbdGroup id="g"><kbd ivKbd id="k" class="ml-1">Ctrl</kbd><kbd ivKbd>K</kbd></kbd>`,
})
class Host {}

describe('IvKbd', () => {
  it('carries hooks, slots and the user class', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const g = fixture.nativeElement.querySelector('#g') as HTMLElement
    const k = fixture.nativeElement.querySelector('#k') as HTMLElement
    expect(g.dataset['slot']).toBe('kbd-group')
    expect(g.classList).toContain('cn-kbd-group')
    expect(k.dataset['slot']).toBe('kbd')
    expect(k.classList).toContain('cn-kbd')
    expect(k.classList).toContain('ml-1')
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

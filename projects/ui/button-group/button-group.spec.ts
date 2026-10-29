import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvButton } from '@ivorie/ui/button'
import { IV_BUTTON_GROUP_IMPORTS, buttonGroupVariants } from '@ivorie/ui/button-group'

@Component({
  imports: [IV_BUTTON_GROUP_IMPORTS, IvButton],
  template: `
    <iv-button-group id="g" [orientation]="orientation()" class="mx-2" aria-label="Text style">
      <iv-button-group-text id="t">Style</iv-button-group-text>
      <button ivButton variant="outline">Bold</button>
      <iv-button-group-separator id="s" />
      <button ivButton variant="outline">Italic</button>
    </iv-button-group>
  `,
})
class Host {
  orientation = signal<'horizontal' | 'vertical'>('horizontal')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement
  return { fixture, el }
}

describe('IvButtonGroup', () => {
  it('exports buttonGroupVariants', () => {
    expect(buttonGroupVariants({ orientation: 'vertical' })).toContain('cn-button-group-orientation-vertical')
  })

  it('is a group with orientation hook and data attribute', async () => {
    const { fixture, el } = await setup()
    const g = el('g')
    expect(g.getAttribute('role')).toBe('group')
    expect(g.dataset['slot']).toBe('button-group')
    expect(g.classList).toContain('cn-button-group')
    expect(g.classList).toContain('cn-button-group-orientation-horizontal')
    expect(g.classList).toContain('mx-2')
    fixture.componentInstance.orientation.set('vertical')
    await fixture.whenStable()
    expect(g.dataset['orientation']).toBe('vertical')
    expect(g.classList).toContain('cn-button-group-orientation-vertical')
  })

  it('text and separator carry their hooks', async () => {
    const { el } = await setup()
    expect(el('t').classList).toContain('cn-button-group-text')
    const s = el('s')
    expect(s.classList).toContain('cn-button-group-separator')
    expect(s.dataset['slot']).toBe('button-group-separator')
    expect(s.dataset['orientation']).toBe('vertical')
    expect(s.getAttribute('role')).toBe('none')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

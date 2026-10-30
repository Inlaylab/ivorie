import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvSeparator } from '@ivorie/ui/separator'

@Component({
  imports: [IvSeparator],
  template: `
    <iv-separator id="d" class="my-4" />
    <iv-separator id="s" [decorative]="false" [orientation]="orientation()" />
  `,
})
class Host {
  orientation = signal<'horizontal' | 'vertical'>('vertical')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement
  return { fixture, el }
}

describe('IvSeparator', () => {
  it('is decorative by default: role none, no aria-orientation', async () => {
    const { el } = await setup()
    expect(el('d').getAttribute('role')).toBe('none')
    expect(el('d').hasAttribute('aria-orientation')).toBe(false)
    expect(el('d').dataset['orientation']).toBe('horizontal')
    expect(el('d').dataset['slot']).toBe('separator')
  })

  it('is a separator with aria-orientation when not decorative', async () => {
    const { fixture, el } = await setup()
    expect(el('s').getAttribute('role')).toBe('separator')
    expect(el('s').getAttribute('aria-orientation')).toBe('vertical')
    fixture.componentInstance.orientation.set('horizontal')
    await fixture.whenStable()
    expect(el('s').getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('uses the shadcn orientation variants and keeps the user class', async () => {
    const { el } = await setup()
    expect(el('d').classList).toContain('data-horizontal:h-px')
    expect(el('d').classList).toContain('data-vertical:w-px')
    expect(el('d').classList).toContain('my-4')
    // A custom element is inline by default; h-px and w-full do nothing on an inline box.
    expect(el('d').classList).toContain('block')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

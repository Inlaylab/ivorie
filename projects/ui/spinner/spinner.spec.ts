import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvSpinner } from '@ivorie/ui/spinner'

@Component({
  imports: [IvSpinner],
  template: `
    <iv-spinner id="a" class="text-primary" />
    <iv-spinner id="b" label="Saving" />
  `,
})
class Host {}

describe('IvSpinner', () => {
  it('is a status with a default label', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const a = fixture.nativeElement.querySelector('#a') as HTMLElement
    expect(a.dataset['slot']).toBe('spinner')
    expect(a.getAttribute('role')).toBe('status')
    expect(a.getAttribute('aria-label')).toBe('Loading')
    expect(a.classList).toContain('animate-spin')
    // Reduced motion slows the spin; it must keep turning so it still reads as busy.
    expect(a.classList).toContain('motion-reduce:animate-[spin_2.4s_linear_infinite]')
    expect(a.classList).toContain('text-primary')
    expect(a.querySelector('svg')).not.toBeNull()
  })

  it('takes a custom label', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelector('#b').getAttribute('aria-label')).toBe('Saving')
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

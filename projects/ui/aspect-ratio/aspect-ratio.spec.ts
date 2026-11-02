import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvAspectRatio } from '@inlaylab/ivorie/aspect-ratio'

@Component({
  imports: [IvAspectRatio],
  template: `<iv-aspect-ratio id="a" [ratio]="ratio()" class="rounded-lg"><img src="x.png" alt="Photo" class="size-full" /></iv-aspect-ratio>`,
})
class Host {
  ratio = signal(16 / 9)
}

describe('IvAspectRatio', () => {
  it('sets aspect-ratio from the ratio input and keeps the user class', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const a = fixture.nativeElement.querySelector('#a') as HTMLElement
    expect(a.dataset['slot']).toBe('aspect-ratio')
    expect(Number(a.style.getPropertyValue('--ratio'))).toBeCloseTo(16 / 9)
    expect(a.classList).toContain('aspect-(--ratio)')
    expect(a.classList).toContain('rounded-lg')
    fixture.componentInstance.ratio.set(1)
    await fixture.whenStable()
    expect(a.style.getPropertyValue('--ratio')).toBe('1')
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

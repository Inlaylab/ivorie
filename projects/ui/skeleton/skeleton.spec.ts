import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvSkeleton } from '@ivorie/ui/skeleton'

@Component({
  imports: [IvSkeleton],
  template: `<iv-skeleton id="s" class="h-4 w-20" />`,
})
class Host {}

describe('IvSkeleton', () => {
  it('carries its hook, slot and the user class', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const s = fixture.nativeElement.querySelector('#s') as HTMLElement
    expect(s.dataset['slot']).toBe('skeleton')
    expect(s.classList).toContain('cn-skeleton')
    expect(s.classList).toContain('animate-pulse')
    expect(s.classList).toContain('w-20')
    // A custom element is inline by default; size classes do nothing on an inline box.
    expect(s.classList).toContain('block')
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

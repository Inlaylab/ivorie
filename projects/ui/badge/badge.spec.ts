import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { BadgeVariants, IvBadge, badgeVariants } from '@ivorie/ui/badge'

@Component({
  imports: [IvBadge],
  template: `<iv-badge id="b" [variant]="variant()" class="ml-2">New</iv-badge>`,
})
class Host {
  variant = signal<BadgeVariants['variant']>('default')
}

describe('badgeVariants', () => {
  it('is exported with its type', () => {
    const v: BadgeVariants = { variant: 'outline' }
    expect(v.variant).toBe('outline')
    expect(badgeVariants({ variant: 'secondary' })).toContain('cn-badge-variant-secondary')
  })
})

describe('IvBadge', () => {
  it('carries hooks, data attributes and the user class', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const b = fixture.nativeElement.querySelector('#b') as HTMLElement
    expect(b.dataset['slot']).toBe('badge')
    expect(b.classList).toContain('cn-badge')
    expect(b.classList).toContain('cn-badge-variant-default')
    expect(b.classList).toContain('ml-2')
    fixture.componentInstance.variant.set('destructive')
    await fixture.whenStable()
    expect(b.dataset['variant']).toBe('destructive')
    expect(b.classList).toContain('cn-badge-variant-destructive')
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

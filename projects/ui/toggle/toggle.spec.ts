import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvToggle, ToggleVariants, toggleVariants } from '@inlaylab/ivorie/toggle'

@Component({
  imports: [IvToggle],
  template: `<button ivToggle id="t" aria-label="Bold" [(pressed)]="pressed" [variant]="variant()" size="sm" class="ml-2">B</button>`,
})
class Host {
  pressed = signal(false)
  variant = signal<ToggleVariants['variant']>('default')
}

describe('IvToggle', () => {
  it('exports variants', () => {
    expect(toggleVariants({ variant: 'outline', size: 'lg' })).toContain('cn-toggle-size-lg')
  })

  it('toggles aria-pressed and data-state, with two-way binding', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const t = fixture.nativeElement.querySelector('#t') as HTMLButtonElement
    expect(t.type).toBe('button')
    expect(t.dataset['slot']).toBe('toggle')
    expect(t.classList).toContain('cn-toggle-size-sm')
    expect(t.classList).toContain('ml-2')
    expect(t.getAttribute('aria-pressed')).toBe('false')
    t.click()
    await fixture.whenStable()
    expect(fixture.componentInstance.pressed()).toBe(true)
    expect(t.getAttribute('aria-pressed')).toBe('true')
    expect(t.dataset['state']).toBe('on')
    fixture.componentInstance.pressed.set(false)
    fixture.componentInstance.variant.set('outline')
    await fixture.whenStable()
    expect(t.dataset['state']).toBe('off')
    expect(t.classList).toContain('cn-toggle-variant-outline')
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

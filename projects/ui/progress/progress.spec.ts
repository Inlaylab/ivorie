import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvProgress } from '@ivorie/ui/progress'

@Component({
  imports: [IvProgress],
  template: `<iv-progress [value]="value()" aria-label="Upload" class="w-40" />`,
})
class Host {
  value = signal<number | null>(40)
}

async function setup(value: number | null) {
  const fixture = TestBed.createComponent(Host)
  fixture.componentInstance.value.set(value)
  await fixture.whenStable()
  const bar = fixture.nativeElement.querySelector('[data-slot="progress"]') as HTMLElement
  const indicator = bar.querySelector('[data-slot="progress-indicator"]') as HTMLElement
  return { fixture, bar, indicator }
}

describe('IvProgress', () => {
  it('is a progressbar with value, range and hooks', async () => {
    const { bar, indicator } = await setup(40)
    expect(bar.getAttribute('role')).toBe('progressbar')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.dataset['state']).toBe('loading')
    expect(bar.classList).toContain('cn-progress')
    expect(bar.classList).toContain('w-40')
    expect(indicator.classList).toContain('cn-progress-indicator')
    expect(indicator.style.transform).toBe('translateX(-60%)')
  })

  it.each([
    [150, '100', 'complete', 'translateX(-0%)'],
    [100, '100', 'complete', 'translateX(-0%)'],
    [-5, '0', 'loading', 'translateX(-100%)'],
  ])('clamps %s to %s', async (value, now, state, transform) => {
    const { bar, indicator } = await setup(value)
    expect(bar.getAttribute('aria-valuenow')).toBe(now)
    expect(bar.dataset['state']).toBe(state)
    expect(indicator.style.transform).toBe(transform)
  })

  it.each([null, NaN])('%s is indeterminate: no aria-valuenow, a sliding segment', async (value) => {
    const { bar, indicator } = await setup(value)
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.dataset['state']).toBe('indeterminate')
    // A full-width bar at -100% is off-screen; indeterminate must stay visible.
    expect(indicator.style.transform).toBe('')
    expect(indicator.classList).toContain('animate-progress-indeterminate')
    expect(indicator.classList).toContain('w-2/5')
    // Reduced motion: no sliding, a slow pulse instead.
    expect(indicator.classList).toContain('motion-reduce:animate-[pulse_2.4s_ease-in-out_infinite]')
  })

  it('switches from indeterminate back to a value', async () => {
    const { fixture, indicator } = await setup(null)
    fixture.componentInstance.value.set(30)
    await fixture.whenStable()
    expect(indicator.style.transform).toBe('translateX(-70%)')
    expect(indicator.classList).not.toContain('animate-progress-indeterminate')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup(40)
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

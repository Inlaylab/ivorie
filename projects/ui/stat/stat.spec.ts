import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_STAT_IMPORTS } from '@inlaylab/ivorie/stat'
import { IvDelta } from '@inlaylab/ivorie/delta'

@Component({
  imports: [IV_STAT_IMPORTS, IvDelta],
  template: `
    <iv-stat class="w-64">
      <iv-stat-header><iv-stat-icon>$</iv-stat-icon><iv-stat-label>Revenue</iv-stat-label></iv-stat-header>
      <iv-stat-value>$48,200 <iv-delta [value]="12" /></iv-stat-value>
      <iv-stat-description>vs. last month</iv-stat-description>
    </iv-stat>
  `,
})
class Host {}

describe('IvStat', () => {
  it('lays out icon chip, label, value with a delta, and a description, each with its hook', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const el = fixture.nativeElement.querySelector('[data-slot="stat"]') as HTMLElement
    expect(el.classList).toContain('cn-stat')
    expect(el.classList).toContain('w-64')
    for (const part of ['header', 'icon', 'label', 'value', 'description']) {
      expect(el.querySelector(`[data-slot="stat-${part}"]`)!.classList).toContain(`cn-stat-${part}`)
    }
    expect(el.querySelector('[data-slot="stat-icon"]')!.getAttribute('aria-hidden')).toBe('true')
    expect(el.querySelector('[data-slot="stat-value"] [data-slot="delta"]')).not.toBeNull()
    await expect(el).toHaveNoViolations()
  })
})

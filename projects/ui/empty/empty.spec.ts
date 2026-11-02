import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { EmptyMediaVariants, IV_EMPTY_IMPORTS, emptyMediaVariants } from '@inlaylab/ivorie/empty'

@Component({
  imports: [IV_EMPTY_IMPORTS],
  template: `
    <iv-empty id="e" class="border">
      <iv-empty-header>
        <iv-empty-media id="m" [variant]="variant()">#</iv-empty-media>
        <iv-empty-title>No projects</iv-empty-title>
        <iv-empty-description>Create one to get started.</iv-empty-description>
      </iv-empty-header>
      <iv-empty-content><button type="button">Create project</button></iv-empty-content>
    </iv-empty>
  `,
})
class Host {
  variant = signal<EmptyMediaVariants['variant']>('default')
}

describe('IvEmpty', () => {
  it('exports media variants', () => {
    expect(emptyMediaVariants({ variant: 'icon' })).toContain('cn-empty-media-icon')
  })

  it('renders every part with its slot and hook', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    for (const slot of ['empty', 'empty-header', 'empty-icon', 'empty-title', 'empty-description', 'empty-content']) {
      expect(el.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    expect(el.querySelector('#e')!.classList).toContain('border')
    const m = el.querySelector('#m') as HTMLElement
    expect(m.dataset['variant']).toBe('default')
    fixture.componentInstance.variant.set('icon')
    await fixture.whenStable()
    expect(m.dataset['variant']).toBe('icon')
    expect(m.classList).toContain('cn-empty-media-icon')
    await expect(el).toHaveNoViolations()
  })
})

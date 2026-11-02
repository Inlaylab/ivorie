import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { DialogCloseEvent } from '@inlaylab/ivorie/dialog'
import { IV_SHEET_IMPORTS, IvSheet, SheetSide } from '@inlaylab/ivorie/sheet'

@Component({
  imports: [IV_SHEET_IMPORTS],
  template: `
    <button type="button" id="open" [ivSheetTrigger]="tpl" [ivSheetConfig]="{ side: side() }" (closed)="closed.set($event)">Open</button>
    <ng-template #tpl>
      <iv-sheet-header>
        <iv-sheet-title>Edit profile</iv-sheet-title>
        <iv-sheet-description>Change your name.</iv-sheet-description>
      </iv-sheet-header>
      <input aria-label="Name" />
      <iv-sheet-footer><button type="button" id="save" ivSheetClose="saved">Save</button></iv-sheet-footer>
    </ng-template>
  `,
})
class Host {
  side = signal<SheetSide>('left')
  closed = signal<DialogCloseEvent | null>(null)
}

const panel = () => document.querySelector('[data-slot="sheet-content"]') as HTMLElement | null
const flush = () => new Promise((r) => setTimeout(r, 150))

afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')))

describe('IvSheet', () => {
  it('opens docked to the configured side, labelled by its title', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    fixture.nativeElement.querySelector('#open').click()
    await fixture.whenStable()
    const p = panel()!
    expect(p.getAttribute('role')).toBe('dialog')
    expect(p.dataset['side']).toBe('left')
    expect(p.classList).toContain('cn-sheet-content')
    const title = p.querySelector('[data-slot="sheet-title"]')!
    expect(p.getAttribute('aria-labelledby')).toBe(title.id)
    expect(p.getAttribute('aria-describedby')).toBe(p.querySelector('[data-slot="sheet-description"]')!.id)
    expect(document.querySelector('.cdk-overlay-backdrop')!.classList).toContain('cn-sheet-overlay')
    await expect(p).toHaveNoViolations()
  })

  it('defaults to the right side; close button returns a result', async () => {
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const sheet = TestBed.inject(IvSheet)
    const ref = sheet.open(Host)
    await fixture.whenStable()
    expect(panel()!.dataset['side']).toBe('right')
    ref.close('x')
    await flush()
    expect(ref.closed()).toEqual({ reason: 'programmatic', result: 'x' })

    fixture.componentInstance.side.set('bottom')
    await fixture.whenStable()
    fixture.nativeElement.querySelector('#open').click()
    await fixture.whenStable()
    ;(document.querySelector('#save') as HTMLElement).click()
    await flush()
    expect(fixture.componentInstance.closed()).toEqual({ reason: 'close-button', result: 'saved' })
    expect(panel()).toBeNull()
  })
})

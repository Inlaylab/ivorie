import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { DialogCloseEvent } from '@inlaylab/ivorie/dialog'
import { IV_DRAWER_IMPORTS } from '@inlaylab/ivorie/drawer'

@Component({
  imports: [IV_DRAWER_IMPORTS],
  template: `
    <button type="button" id="open" [ivDrawerTrigger]="tpl" (closed)="closed.set($event)">Open</button>
    <ng-template #tpl>
      <iv-drawer-header>
        <iv-drawer-title>Move goal</iv-drawer-title>
        <iv-drawer-description>Set your daily activity goal.</iv-drawer-description>
      </iv-drawer-header>
      <iv-drawer-footer><button type="button" ivDrawerClose="ok">Submit</button></iv-drawer-footer>
    </ng-template>
  `,
})
class Host {
  closed = signal<DialogCloseEvent | null>(null)
}

const panel = () => document.querySelector('[data-slot="drawer-content"]') as HTMLElement | null
const flush = () => new Promise((r) => setTimeout(r, 150))
const pointer = (el: HTMLElement, type: string, clientY: number, target: Element = el) =>
  target.dispatchEvent(new PointerEvent(type, { clientY, clientX: 0, button: 0, bubbles: true }))

afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')))

async function open() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  fixture.nativeElement.querySelector('#open').click()
  await fixture.whenStable()
  const p = panel()!
  p.getBoundingClientRect = () => ({ top: 400, height: 400, width: 800, left: 0 }) as DOMRect
  return { fixture, p }
}

describe('IvDrawer', () => {
  it('opens from the bottom with a handle, labelled by its title', async () => {
    const { p } = await open()
    expect(p.getAttribute('role')).toBe('dialog')
    expect(p.dataset['vaulDrawerDirection']).toBe('bottom')
    expect(p.querySelector('.cn-drawer-handle')).not.toBeNull()
    expect(p.querySelector('[data-slot="drawer-close"]')).not.toBeNull()
    expect(p.getAttribute('aria-labelledby')).toBe(p.querySelector('[data-slot="drawer-title"]')!.id)
    expect(document.querySelector('.cdk-overlay-backdrop')!.classList).toContain('cn-drawer-overlay')
    await expect(p).toHaveNoViolations()
  })

  it('a short drag springs back; a long drag closes with reason drag', async () => {
    const { fixture, p } = await open()
    pointer(p, 'pointerdown', 410)
    pointer(p, 'pointermove', 450)
    await fixture.whenStable()
    expect(p.style.transform).toBe('translateY(40px)')
    pointer(p, 'pointerup', 450)
    await fixture.whenStable()
    expect(p.style.transform).toBe('')
    pointer(p, 'pointerdown', 410)
    pointer(p, 'pointermove', 600)
    pointer(p, 'pointerup', 600)
    await flush()
    expect(fixture.componentInstance.closed()).toEqual({ reason: 'drag', result: undefined })
  })

  it('a drag that starts on a button does not move the drawer', async () => {
    const { fixture, p } = await open()
    const button = p.querySelector('button') as HTMLElement
    pointer(p, 'pointerdown', 410, button)
    pointer(p, 'pointermove', 700)
    await fixture.whenStable()
    expect(p.style.transform).toBe('')
    button.click()
    await flush()
    expect(fixture.componentInstance.closed()).toEqual({ reason: 'close-button', result: 'ok' })
  })
})

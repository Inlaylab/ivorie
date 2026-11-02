import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_RESIZABLE_IMPORTS } from '@inlaylab/ivorie/resizable'

@Component({
  imports: [IV_RESIZABLE_IMPORTS],
  template: `
    <iv-resizable-panel-group class="h-40 rounded-lg border" (layoutChange)="layout.set($event)">
      <iv-resizable-panel defaultSize="30" minSize="20">One</iv-resizable-panel>
      <iv-resizable-handle [withHandle]="true" />
      <iv-resizable-panel>Two</iv-resizable-panel>
      <iv-resizable-handle />
      <iv-resizable-panel maxSize="40">Three</iv-resizable-panel>
    </iv-resizable-panel-group>
  `,
})
class Host {
  layout = signal<number[]>([])
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const panels = [...el.querySelectorAll('[data-slot="resizable-panel"]')] as HTMLElement[]
  const handles = [...el.querySelectorAll('[role="separator"]')] as HTMLElement[]
  const group = el.querySelector('iv-resizable-panel-group') as HTMLElement
  const grow = () => panels.map((p) => Number(p.style.flexGrow))
  const key = async (h: HTMLElement, k: string) => {
    h.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
    await fixture.whenStable()
  }
  return { fixture, panels, handles, group, grow, key }
}

describe('IvResizable', () => {
  it('splits the space: defaultSize first, the rest shared equally', async () => {
    const { grow, handles, panels } = await setup()
    expect(grow()).toEqual([30, 35, 35])
    expect(handles[0].getAttribute('aria-orientation')).toBe('vertical')
    expect(handles[0].getAttribute('aria-controls')).toBe(panels[0].id)
    expect(handles[0].getAttribute('aria-valuenow')).toBe('30')
    expect(handles[0].querySelector('.cn-resizable-handle-icon')).not.toBeNull()
  })

  it('keyboard resizes within min and max', async () => {
    const { fixture, handles, grow, key } = await setup()
    await key(handles[0], 'ArrowRight')
    expect(grow()).toEqual([40, 25, 35])
    expect(fixture.componentInstance.layout()).toEqual([40, 25, 35])
    await key(handles[0], 'Home')
    expect(grow()).toEqual([20, 45, 35])
    // Panel three stops at maxSize 40.
    await key(handles[1], 'Home')
    expect(grow()).toEqual([20, 40, 40])
  })

  it('pointer drag moves the boundary by the dragged share of the group', async () => {
    const { fixture, group, handles, grow } = await setup()
    group.getBoundingClientRect = () => ({ left: 0, top: 0, width: 500, height: 160 }) as DOMRect
    handles[0].dispatchEvent(new PointerEvent('pointerdown', { clientX: 150, button: 0 }))
    handles[0].dispatchEvent(new PointerEvent('pointermove', { clientX: 200 }))
    await fixture.whenStable()
    expect(grow()).toEqual([40, 25, 35])
    handles[0].dispatchEvent(new PointerEvent('pointerup', { clientX: 200 }))
    handles[0].dispatchEvent(new PointerEvent('pointermove', { clientX: 300 }))
    await fixture.whenStable()
    expect(grow()).toEqual([40, 25, 35])
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

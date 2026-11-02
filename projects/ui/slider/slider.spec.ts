import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it } from 'vitest'
import { IvSlider } from '@inlaylab/ivorie/slider'

@Component({
  imports: [IvSlider],
  template: `<iv-slider id="s" aria-label="Volume" [(value)]="value" [step]="step()" class="w-60" />`,
})
class Host {
  value = signal<number[] | null>([50])
  step = signal(1)
}

@Component({
  imports: [IvSlider, ReactiveFormsModule],
  template: `<iv-slider aria-label="Price" [min]="0" [max]="1000" [step]="10" [formControl]="control" />`,
})
class RangeHost {
  control = new FormControl<number[] | null>([200, 800])
}

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))

function pointer(el: HTMLElement, type: string, clientX: number) {
  el.dispatchEvent(new PointerEvent(type, { clientX, button: 0, bubbles: true }))
}

async function setup<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type)
  await fixture.whenStable()
  const host = fixture.nativeElement.querySelector('iv-slider') as HTMLElement
  const thumbs = () => [...host.querySelectorAll('[role="slider"]')] as HTMLElement[]
  return { fixture, host, thumbs }
}

describe('IvSlider', () => {
  it('renders a labelled thumb with ARIA values and the user class', async () => {
    const { host, thumbs } = await setup(Host)
    expect(host.dataset['slot']).toBe('slider')
    expect(host.classList).toContain('w-60')
    expect(host.getAttribute('aria-label')).toBeNull()
    const [t] = thumbs()
    expect(t.getAttribute('aria-label')).toBe('Volume')
    expect(t.getAttribute('aria-valuenow')).toBe('50')
    expect(t.getAttribute('aria-valuemin')).toBe('0')
    expect(t.getAttribute('aria-valuemax')).toBe('100')
    expect(t.style.left).toBe('50%')
    expect((host.querySelector('[data-slot="slider-range"]') as HTMLElement).style.right).toBe('50%')
  })

  it('keyboard: arrows step, PageUp jumps 10 steps, Home/End go to the ends', async () => {
    const { fixture, thumbs } = await setup(Host)
    const [t] = thumbs()
    key(t, 'ArrowRight')
    expect(fixture.componentInstance.value()).toEqual([51])
    key(t, 'ArrowDown')
    key(t, 'ArrowDown')
    expect(fixture.componentInstance.value()).toEqual([49])
    key(t, 'PageUp')
    expect(fixture.componentInstance.value()).toEqual([59])
    key(t, 'End')
    key(t, 'ArrowRight')
    expect(fixture.componentInstance.value()).toEqual([100])
    key(t, 'Home')
    expect(fixture.componentInstance.value()).toEqual([0])
  })

  it('snaps to a fractional step without float noise', async () => {
    const { fixture, thumbs } = await setup(Host)
    fixture.componentInstance.value.set([0])
    fixture.componentInstance.step.set(0.1)
    await fixture.whenStable()
    key(thumbs()[0], 'ArrowRight')
    key(thumbs()[0], 'ArrowRight')
    key(thumbs()[0], 'ArrowRight')
    expect(fixture.componentInstance.value()).toEqual([0.3])
  })

  it('pointer: press and drag move the thumb', async () => {
    const { fixture, host } = await setup(Host)
    host.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 20, bottom: 20, right: 200 }) as DOMRect
    pointer(host, 'pointerdown', 50)
    expect(fixture.componentInstance.value()).toEqual([25])
    pointer(host, 'pointermove', 180)
    expect(fixture.componentInstance.value()).toEqual([90])
    pointer(host, 'pointerup', 180)
    pointer(host, 'pointermove', 20)
    expect(fixture.componentInstance.value()).toEqual([90])
  })

  it('range: two thumbs that never cross, with forms', async () => {
    const { fixture, host, thumbs } = await setup(RangeHost)
    expect(thumbs().length).toBe(2)
    const range = host.querySelector('[data-slot="slider-range"]') as HTMLElement
    expect(range.style.left).toBe('20%')
    expect(range.style.right).toBe('20%')
    key(thumbs()[0], 'End')
    expect(fixture.componentInstance.control.value).toEqual([800, 800])
    host.getBoundingClientRect = () => ({ left: 0, width: 1000, top: 0, height: 20, bottom: 20, right: 1000 }) as DOMRect
    // Stacked thumbs: pressing to the right moves the upper one.
    pointer(host, 'pointerdown', 900)
    expect(fixture.componentInstance.control.value).toEqual([800, 900])
    pointer(host, 'pointerup', 900)
    fixture.componentInstance.control.disable()
    await fixture.whenStable()
    expect(host.dataset['disabled']).toBe('')
    expect(thumbs()[0].getAttribute('tabindex')).toBeNull()
    key(thumbs()[0], 'Home')
    expect(fixture.componentInstance.control.value).toEqual([800, 900])
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup(RangeHost)
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

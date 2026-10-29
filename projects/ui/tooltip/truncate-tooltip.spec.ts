import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Overlay } from '@angular/cdk/overlay'
import { IvTruncateTooltip } from './truncate-tooltip'

@Component({
  imports: [IvTruncateTooltip],
  template: `
    <span
      id="host"
      class="truncate"
      [ivTruncateTooltip]="text()"
      [ivTruncateTooltipMeasure]="measureInner() ? inner : null"
      >Execution request approvals <span #inner id="inner">Execution request approvals</span></span
    >
  `,
})
class TestHostComponent {
  text = signal('Execution request approvals')
  measureInner = signal(false)
}

// jsdom has no layout (DECISIONS 2026-10-27): mock the two sizes the directive reads.
function setSize(el: HTMLElement, scrollWidth: number, clientWidth: number) {
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth })
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth })
}

describe('IvTruncateTooltip', () => {
  let fixture: ComponentFixture<TestHostComponent>
  let host: HTMLElement
  let inner: HTMLElement

  const tooltip = () => document.querySelector<HTMLElement>('[role="tooltip"]')
  const hover = async () => {
    host.dispatchEvent(new Event('mouseenter'))
    await vi.advanceTimersByTimeAsync(200)
    fixture.detectChanges()
  }

  beforeEach(() => {
    vi.useFakeTimers()
    fixture = TestBed.createComponent(TestHostComponent)
    fixture.detectChanges()
    host = fixture.nativeElement.querySelector('#host')
    inner = fixture.nativeElement.querySelector('#inner')
    setSize(host, 200, 40)
    setSize(inner, 200, 200)
  })

  afterEach(() => {
    fixture.destroy()
    vi.useRealTimers()
  })

  it('shows the tooltip when the text is truncated', async () => {
    await hover()
    expect(tooltip()?.textContent).toContain('Execution request approvals')
    expect(tooltip()!.classList).toContain('cn-tooltip-content')
    expect(tooltip()!.hasAttribute('aria-live')).toBe(false)
  })

  it('does not show the tooltip when the text fits', async () => {
    setSize(host, 200, 200)
    await hover()
    expect(tooltip()).toBeNull()
  })

  it('does not show the tooltip for empty text', async () => {
    fixture.componentInstance.text.set('  ')
    fixture.detectChanges()
    await hover()
    expect(tooltip()).toBeNull()
  })

  it('measures the given element instead of the host', async () => {
    setSize(host, 200, 200)
    setSize(inner, 200, 40)
    fixture.componentInstance.measureInner.set(true)
    fixture.detectChanges()
    await hover()
    expect(tooltip()).not.toBeNull()
  })

  it('hides on mousedown', async () => {
    await hover()
    expect(tooltip()).not.toBeNull()
    host.dispatchEvent(new Event('mousedown'))
    fixture.detectChanges()
    expect(tooltip()).toBeNull()
  })

  it('creates no overlay before hover; destroy mid-delay opens nothing', async () => {
    const create = vi.spyOn(TestBed.inject(Overlay), 'create')
    host.dispatchEvent(new Event('mouseenter'))
    await vi.advanceTimersByTimeAsync(100)
    expect(create).not.toHaveBeenCalled()
    fixture.destroy()
    await vi.advanceTimersByTimeAsync(500)
    expect(create).not.toHaveBeenCalled()
    expect(tooltip()).toBeNull()
  })
})

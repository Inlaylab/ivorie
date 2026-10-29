import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it, vi } from 'vitest'
import { IvSwitch } from '@ivorie/ui/switch'

@Component({
  imports: [IvSwitch, FormsModule],
  template: `
    <label for="wifi">Wi-Fi</label>
    <iv-switch id="wifi" [(ngModel)]="on" [size]="size()" (checkedChange)="changes.push($event)" class="ml-1" />
  `,
})
class ModelHost {
  on = signal(false)
  size = signal<'default' | 'sm'>('default')
  changes: boolean[] = []
}

@Component({
  imports: [IvSwitch, ReactiveFormsModule],
  template: `<iv-switch aria-label="Dark mode" [formControl]="control" [disabled]="disabled()" (checkedChange)="changes.push($event)" />`,
})
class FormHost {
  control = new FormControl(false, { nonNullable: true })
  disabled = signal(false)
  changes: boolean[] = []
}

async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host)
  await fixture.whenStable()
  const sw = fixture.nativeElement.querySelector('[data-slot="switch"]') as HTMLButtonElement
  const key = async (key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    sw.dispatchEvent(event)
    await fixture.whenStable()
    return event
  }
  return { fixture, sw, key, host: fixture.componentInstance }
}

describe('IvSwitch', () => {
  it('carries hooks, role, data-state and data-size', async () => {
    const { fixture, sw, host } = await render(ModelHost)
    expect(sw.tagName).toBe('BUTTON')
    expect(sw.getAttribute('type')).toBe('button')
    expect(sw.getAttribute('role')).toBe('switch')
    expect(sw.id).toBe('wifi')
    expect(fixture.nativeElement.querySelectorAll('#wifi').length).toBe(1)
    expect(sw.classList).toContain('cn-switch')
    expect(sw.classList).toContain('ml-1')
    const thumb = sw.querySelector('[data-slot="switch-thumb"]') as HTMLElement
    expect(thumb.classList).toContain('cn-switch-thumb')
    expect(sw.dataset['state']).toBe('unchecked')
    expect(thumb.dataset['state']).toBe('unchecked')
    expect(sw.dataset['size']).toBe('default')
    host.size.set('sm')
    await fixture.whenStable()
    expect(sw.dataset['size']).toBe('sm')
  })

  it('ngModel → view, click → model, emits once', async () => {
    const { fixture, sw, host } = await render(ModelHost)
    host.on.set(true)
    await fixture.whenStable()
    expect(sw.getAttribute('aria-checked')).toBe('true')
    expect(sw.dataset['state']).toBe('checked')
    sw.click()
    await fixture.whenStable()
    expect(host.on()).toBe(false)
    expect(host.changes).toEqual([false])
  })

  // Space and Enter on a native button fire a click (browser, not jsdom). The switch must not block them
  // or handle them itself, else a real browser toggles twice.
  it('Space and Enter are left to the native button', async () => {
    const { sw, key, host } = await render(ModelHost)
    expect(sw.tagName).toBe('BUTTON')
    expect((await key(' ')).defaultPrevented).toBe(false)
    expect((await key('Enter')).defaultPrevented).toBe(false)
    expect(host.changes).toEqual([])
  })

  it('a label click toggles it', async () => {
    const { fixture, host } = await render(ModelHost)
    ;(fixture.nativeElement.querySelector('label') as HTMLElement).click()
    await fixture.whenStable()
    expect(host.on()).toBe(true)
  })

  it('setValue updates the view and does not emit', async () => {
    const { fixture, sw, host } = await render(FormHost)
    const onChange = vi.fn()
    host.control.valueChanges.subscribe(onChange)
    host.control.setValue(true)
    await fixture.whenStable()
    expect(sw.getAttribute('aria-checked')).toBe('true')
    expect(host.changes).toEqual([])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('stays disabled when the form disables it, even if [disabled] changes', async () => {
    const { fixture, sw, host, key } = await render(FormHost)
    host.control.disable()
    await fixture.whenStable()
    expect(sw.disabled).toBe(true)
    expect(sw.hasAttribute('data-disabled')).toBe(true)
    host.disabled.set(true)
    await fixture.whenStable()
    host.disabled.set(false)
    await fixture.whenStable()
    expect(sw.disabled).toBe(true)
    sw.click()
    await key('Enter')
    expect(host.control.value).toBe(false)
    host.control.enable()
    await fixture.whenStable()
    expect(sw.disabled).toBe(false)
  })

  it('blur marks the control touched', async () => {
    const { fixture, sw, host } = await render(FormHost)
    sw.dispatchEvent(new FocusEvent('blur'))
    await fixture.whenStable()
    expect(host.control.touched).toBe(true)
  })

  it('has no axe violations', async () => {
    const { fixture } = await render(ModelHost)
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

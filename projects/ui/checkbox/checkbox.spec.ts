import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it, vi } from 'vitest'
import { IvCheckbox } from '@inlaylab/ivorie/checkbox'

@Component({
  imports: [IvCheckbox, FormsModule],
  template: `
    <label for="terms">Accept</label>
    <iv-checkbox id="terms" [(ngModel)]="accepted" [indeterminate]="mixed()" (checkedChange)="changes.push($event)" class="ml-1" />
  `,
})
class ModelHost {
  accepted = signal(false)
  mixed = signal(false)
  changes: boolean[] = []
}

@Component({
  imports: [IvCheckbox, ReactiveFormsModule],
  template: `<iv-checkbox aria-label="Agree" [formControl]="control" [disabled]="disabled()" (checkedChange)="changes.push($event)" />`,
})
class FormHost {
  control = new FormControl(false, { nonNullable: true })
  disabled = signal(false)
  changes: boolean[] = []
}

async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host)
  await fixture.whenStable()
  const box = fixture.nativeElement.querySelector('[data-slot="checkbox"]') as HTMLButtonElement
  const key = async (key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    box.dispatchEvent(event)
    await fixture.whenStable()
    return event
  }
  return { fixture, box, key, host: fixture.componentInstance }
}

describe('IvCheckbox', () => {
  it('carries hooks, role and data-state', async () => {
    const { fixture, box } = await render(ModelHost)
    expect(box.tagName).toBe('BUTTON')
    expect(box.getAttribute('type')).toBe('button')
    expect(box.getAttribute('role')).toBe('checkbox')
    expect(box.id).toBe('terms')
    expect(fixture.nativeElement.querySelectorAll('#terms').length).toBe(1)
    expect(box.classList).toContain('cn-checkbox')
    expect(box.classList).toContain('ml-1')
    expect(box.querySelector('[data-slot="checkbox-indicator"]')!.classList).toContain('cn-checkbox-indicator')
    expect(box.dataset['state']).toBe('unchecked')
  })

  it('ngModel → view, click → model, emits once', async () => {
    const { fixture, box, host } = await render(ModelHost)
    host.accepted.set(true)
    await fixture.whenStable()
    expect(box.getAttribute('aria-checked')).toBe('true')
    expect(box.dataset['state']).toBe('checked')
    box.click()
    await fixture.whenStable()
    expect(host.accepted()).toBe(false)
    expect(host.changes).toEqual([false])
  })

  it('indeterminate → mixed; a click makes it checked', async () => {
    const { fixture, box, host } = await render(ModelHost)
    host.mixed.set(true)
    await fixture.whenStable()
    expect(box.getAttribute('aria-checked')).toBe('mixed')
    expect(box.dataset['state']).toBe('indeterminate')
    box.click()
    await fixture.whenStable()
    expect(box.getAttribute('aria-checked')).toBe('true')
  })

  // Space activates the native button (a click). Enter must not, like Radix.
  it('Enter does not toggle', async () => {
    const { key, host } = await render(ModelHost)
    expect((await key('Enter')).defaultPrevented).toBe(true)
    expect(host.accepted()).toBe(false)
  })

  it('a label click toggles it', async () => {
    const { fixture, host } = await render(ModelHost)
    ;(fixture.nativeElement.querySelector('label') as HTMLElement).click()
    await fixture.whenStable()
    expect(host.accepted()).toBe(true)
  })

  it('setValue updates the view and does not emit', async () => {
    const { fixture, box, host } = await render(FormHost)
    const onChange = vi.fn()
    host.control.valueChanges.subscribe(onChange)
    host.control.setValue(true)
    await fixture.whenStable()
    expect(box.getAttribute('aria-checked')).toBe('true')
    expect(host.changes).toEqual([])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('stays disabled when the form disables it, even if [disabled] changes', async () => {
    const { fixture, box, host } = await render(FormHost)
    host.control.disable()
    await fixture.whenStable()
    expect(box.disabled).toBe(true)
    host.disabled.set(true)
    await fixture.whenStable()
    host.disabled.set(false)
    await fixture.whenStable()
    expect(box.disabled).toBe(true)
    box.click()
    expect(host.control.value).toBe(false)
    host.control.enable()
    await fixture.whenStable()
    expect(box.disabled).toBe(false)
  })

  it('blur marks the control touched', async () => {
    const { fixture, box, host } = await render(FormHost)
    box.dispatchEvent(new FocusEvent('blur'))
    await fixture.whenStable()
    expect(host.control.touched).toBe(true)
  })

  it('has no axe violations', async () => {
    const { fixture } = await render(ModelHost)
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

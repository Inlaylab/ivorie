import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it } from 'vitest'
import { IV_INPUT_OTP_IMPORTS, REGEXP_ONLY_DIGITS } from '@inlaylab/ivorie/input-otp'

@Component({
  imports: [IV_INPUT_OTP_IMPORTS, ReactiveFormsModule],
  template: `
    <iv-input-otp maxLength="4" aria-label="Code" [pattern]="pattern" [formControl]="code" (complete)="done.set($event)">
      <iv-input-otp-group>
        <iv-input-otp-slot index="0" />
        <iv-input-otp-slot index="1" />
      </iv-input-otp-group>
      <iv-input-otp-separator />
      <iv-input-otp-group>
        <iv-input-otp-slot index="2" />
        <iv-input-otp-slot index="3" />
      </iv-input-otp-group>
    </iv-input-otp>
  `,
})
class Host {
  pattern = REGEXP_ONLY_DIGITS
  code = new FormControl('')
  done = signal('')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const input = el.querySelector('input') as HTMLInputElement
  const slots = () => [...el.querySelectorAll('[data-slot="input-otp-slot"]')] as HTMLElement[]
  const type = async (v: string) => {
    input.value = v
    input.dispatchEvent(new Event('input'))
    await fixture.whenStable()
  }
  return { fixture, el, input, slots, type }
}

describe('IvInputOtp', () => {
  it('one native input for typing, paste and autofill', async () => {
    const { input, slots } = await setup()
    expect(input.getAttribute('autocomplete')).toBe('one-time-code')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(input.getAttribute('maxlength')).toBe('4')
    expect(input.getAttribute('aria-label')).toBe('Code')
    expect(slots().every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('slots show the characters; the caret sits on the next empty slot', async () => {
    const { fixture, input, slots, type } = await setup()
    input.dispatchEvent(new FocusEvent('focus'))
    await fixture.whenStable()
    expect(slots()[0].dataset['active']).toBe('true')
    await type('12')
    expect(slots().map((s) => s.textContent!.trim())).toEqual(['1', '2', '', ''])
    expect(slots()[2].dataset['active']).toBe('true')
    expect(fixture.componentInstance.code.value).toBe('12')
  })

  it('paste fills every slot and fires complete; the pattern rejects letters', async () => {
    const { fixture, input, type } = await setup()
    await type('12a')
    expect(input.value).toBe('')
    expect(fixture.componentInstance.code.value).toBe('')
    await type('987654')
    expect(fixture.componentInstance.code.value).toBe('9876')
    expect(fixture.componentInstance.done()).toBe('9876')
  })

  it('writes from the form and disables', async () => {
    const { fixture, input, slots } = await setup()
    fixture.componentInstance.code.setValue('42')
    fixture.componentInstance.code.disable()
    await fixture.whenStable()
    expect(slots()[1].textContent!.trim()).toBe('2')
    expect(input.disabled).toBe(true)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field'

type Orientation = 'vertical' | 'horizontal' | 'responsive'

@Component({
  imports: [IV_FIELD_IMPORTS],
  template: `
    <fieldset ivFieldSet>
      <legend ivFieldLegend variant="label">Profile</legend>
      <p ivFieldDescription>About you</p>
      <iv-field-group>
        <iv-field id="f" [orientation]="orientation()" [invalid]="invalid()" class="gap-1">
          <iv-field-content>
            <iv-field-title>Email</iv-field-title>
            <iv-field-description>Work email</iv-field-description>
          </iv-field-content>
          <iv-field-error id="msg" [message]="error()" />
          <iv-field-error id="projected">Required</iv-field-error>
          <iv-field-error id="none" />
        </iv-field>
        <iv-field-separator id="sep">or</iv-field-separator>
      </iv-field-group>
    </fieldset>
  `,
})
class Host {
  orientation = signal<Orientation>('vertical')
  error = signal('')
  invalid = signal(false)
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement
  return { fixture, el }
}

describe('IvField', () => {
  it.each([
    ['fieldset', 'cn-field-set'],
    ['legend', 'cn-field-legend'],
    ['p[data-slot=field-description]', 'cn-field-description'],
    ['iv-field-group', 'cn-field-group'],
    ['iv-field-content', 'cn-field-content'],
    ['iv-field-title', 'cn-field-title'],
    ['iv-field-separator', 'cn-field-separator'],
    ['[data-slot=field-separator-content]', 'cn-field-separator-content'],
  ])('%s has hook %s', async (sel, hook) => {
    const { el } = await setup()
    expect(el(sel).classList).toContain(hook)
  })

  it('legend sets data-variant', async () => {
    const { el } = await setup()
    expect(el('legend').dataset['variant']).toBe('label')
  })

  it('field is a group with orientation attribute and hook, plus the user class', async () => {
    const { fixture, el } = await setup()
    const f = el('#f')
    expect(f.getAttribute('role')).toBe('group')
    expect(f.dataset['orientation']).toBe('vertical')
    expect(f.classList).toContain('cn-field-orientation-vertical')
    expect(f.classList).toContain('gap-1')
    fixture.componentInstance.orientation.set('responsive')
    await fixture.whenStable()
    expect(f.dataset['orientation']).toBe('responsive')
    expect(f.classList).toContain('cn-field-orientation-responsive')
  })

  it('invalid sets data-invalid="true", else no attribute', async () => {
    const { fixture, el } = await setup()
    expect(el('#f').hasAttribute('data-invalid')).toBe(false)
    fixture.componentInstance.invalid.set(true)
    await fixture.whenStable()
    expect(el('#f').dataset['invalid']).toBe('true')
  })

  it('error is role alert, shows a message or projected text, and is empty otherwise', async () => {
    const { fixture, el } = await setup()
    expect(el('#msg').getAttribute('role')).toBe('alert')
    expect(el('#msg').classList).toContain('cn-field-error')
    expect(el('#msg').matches(':empty')).toBe(true)
    expect(el('#none').matches(':empty')).toBe(true)
    expect(el('#projected').textContent?.trim()).toBe('Required')
    fixture.componentInstance.error.set('Bad email')
    await fixture.whenStable()
    expect(el('#msg').textContent?.trim()).toBe('Bad email')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

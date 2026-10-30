import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { describe, expect, it } from 'vitest'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'

@Component({
  imports: [IV_INPUT_IMPORTS, FormsModule],
  template: `
    <label ivLabel for="name">Name</label>
    <input ivInput id="name" [(ngModel)]="name" aria-invalid="true" class="max-w-xs" />
    <label ivLabel for="bio">Bio</label>
    <textarea ivTextarea id="bio"></textarea>
    <iv-input-group id="g">
      <input ivInputGroupInput id="q" aria-label="Search" />
      <iv-input-group-addon id="addon" align="inline-end">
        <iv-input-group-text id="t">⌘K</iv-input-group-text>
        <iv-input-group-button id="btn" size="icon-xs" aria-label="Clear">x</iv-input-group-button>
      </iv-input-group-addon>
    </iv-input-group>
  `,
})
class Host {
  name = signal('Ada')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement
  return { fixture, el }
}

describe('IvInput family', () => {
  it('input works with ngModel both ways (native value, no CVA needed)', async () => {
    const { fixture, el } = await setup()
    const input = el('name') as HTMLInputElement
    expect(input.value).toBe('Ada')
    input.value = 'Grace'
    input.dispatchEvent(new Event('input'))
    await fixture.whenStable()
    expect(fixture.componentInstance.name()).toBe('Grace')
  })

  it('input keeps aria-invalid, its hook and the user class', async () => {
    const { el } = await setup()
    const input = el('name')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.dataset['slot']).toBe('input')
    expect(input.classList).toContain('cn-input')
    expect(input.classList).toContain('max-w-xs')
  })

  it('textarea and label carry their hooks', async () => {
    const { fixture, el } = await setup()
    expect(el('bio').classList).toContain('cn-textarea')
    const label = fixture.nativeElement.querySelector('label[for="name"]') as HTMLElement
    expect(label.classList).toContain('cn-label')
    expect(label.dataset['slot']).toBe('label')
  })

  it('input group parts carry their hooks', async () => {
    const { el } = await setup()
    expect(el('g').classList).toContain('cn-input-group')
    expect(el('g').getAttribute('role')).toBe('group')
    expect(el('q').classList).toContain('cn-input-group-input')
    expect(el('q').classList).toContain('cn-input')
    expect(el('q').dataset['slot']).toBe('input-group-control')
    expect(el('addon').classList).toContain('cn-input-group-addon-align-inline-end')
    expect(el('addon').dataset['align']).toBe('inline-end')
    expect(el('t').classList).toContain('cn-input-group-text')
    const button = el('btn').querySelector('button') as HTMLElement
    expect(button.classList).toContain('cn-input-group-button-size-icon-xs')
    expect(button.classList).toContain('cn-button-variant-ghost')
    expect(button.getAttribute('type')).toBe('button')
  })

  it('clicking the addon focuses the input', async () => {
    const { el } = await setup()
    el('t').click()
    expect(document.activeElement).toBe(el('q'))
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

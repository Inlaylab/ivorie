import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it } from 'vitest'
import { IV_TOGGLE_GROUP_IMPORTS, ToggleGroupType, ToggleGroupValue } from '@inlaylab/ivorie/toggle-group'

@Component({
  imports: [IV_TOGGLE_GROUP_IMPORTS],
  template: `
    <iv-toggle-group id="g" aria-label="Align" [type]="type()" [(value)]="value" variant="outline" [spacing]="0">
      <button ivToggleGroupItem value="left">Left</button>
      <button ivToggleGroupItem value="center" [disabled]="true">Center</button>
      <button ivToggleGroupItem value="right">Right</button>
    </iv-toggle-group>
  `,
})
class Host {
  type = signal<ToggleGroupType>('single')
  value: ToggleGroupValue = null
}

@Component({
  imports: [IV_TOGGLE_GROUP_IMPORTS, ReactiveFormsModule],
  template: `
    <iv-toggle-group type="multiple" aria-label="Format" [formControl]="control">
      <button ivToggleGroupItem value="bold">B</button>
      <button ivToggleGroupItem value="italic">I</button>
    </iv-toggle-group>
  `,
})
class FormHost {
  control = new FormControl<ToggleGroupValue>(['italic'])
}

async function setup<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type)
  await fixture.whenStable()
  const items = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[]
  return { fixture, items }
}

describe('IvToggleGroup', () => {
  it('single: one pressed value, click again clears it', async () => {
    const { fixture, items } = await setup(Host)
    const g = fixture.nativeElement.querySelector('#g') as HTMLElement
    expect(g.getAttribute('role')).toBe('group')
    expect(g.dataset['spacing']).toBe('0')
    expect(items[0].getAttribute('role')).toBe('radio')
    expect(items[0].dataset['variant']).toBe('outline')
    expect(items[0].classList).toContain('cn-toggle-variant-outline')
    items[0].click()
    await fixture.whenStable()
    expect(fixture.componentInstance.value).toBe('left')
    expect(items[0].getAttribute('aria-checked')).toBe('true')
    items[2].click()
    await fixture.whenStable()
    expect(fixture.componentInstance.value).toBe('right')
    expect(items[0].dataset['state']).toBe('off')
    items[2].click()
    await fixture.whenStable()
    expect(fixture.componentInstance.value).toBeNull()
  })

  it('multiple: values add and remove, aria-pressed', async () => {
    const { fixture, items } = await setup(Host)
    fixture.componentInstance.type.set('multiple')
    await fixture.whenStable()
    items[0].click()
    items[2].click()
    await fixture.whenStable()
    expect(fixture.componentInstance.value).toEqual(['left', 'right'])
    expect(items[0].getAttribute('aria-pressed')).toBe('true')
    expect(items[0].getAttribute('role')).toBeNull()
    items[0].click()
    await fixture.whenStable()
    expect(fixture.componentInstance.value).toEqual(['right'])
  })

  it('roving focus: one tab stop, arrows skip disabled items and wrap', async () => {
    const { fixture, items } = await setup(Host)
    expect(items.map((b) => b.tabIndex)).toEqual([0, -1, -1])
    expect(items[1].disabled).toBe(true)
    items[0].focus()
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(items[2])
    items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(items[0])
    expect(fixture.componentInstance.value).toBeNull()
  })

  it('works with reactive forms, including disable', async () => {
    const { fixture, items } = await setup(FormHost)
    expect(items[1].getAttribute('aria-pressed')).toBe('true')
    expect(items[1].tabIndex).toBe(0)
    items[0].click()
    expect(fixture.componentInstance.control.value).toEqual(['italic', 'bold'])
    fixture.componentInstance.control.disable()
    await fixture.whenStable()
    expect(items.every((b) => b.disabled)).toBe(true)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup(Host)
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

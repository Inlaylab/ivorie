import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it } from 'vitest'
import { IV_NATIVE_SELECT_IMPORTS, NativeSelectSize } from '@inlaylab/ivorie/native-select'

@Component({
  imports: [IV_NATIVE_SELECT_IMPORTS, ReactiveFormsModule, FormsModule],
  template: `
    <iv-native-select id="w" [size]="size()" class="w-48">
      <select ivNativeSelect id="s" aria-label="Fruit" [formControl]="control">
        <optgroup ivNativeSelectOptGroup label="Fruit">
          <option ivNativeSelectOption value="apple">Apple</option>
          <option ivNativeSelectOption value="pear">Pear</option>
        </optgroup>
      </select>
    </iv-native-select>
    <select ivNativeSelect id="bare" aria-label="Bare" [(ngModel)]="bare">
      <option value="a">A</option>
      <option value="b">B</option>
    </select>
  `,
})
class Host {
  size = signal<NativeSelectSize>('default')
  control = new FormControl('pear')
  bare = 'a'
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  return { fixture, el, w: el.querySelector('#w') as HTMLElement, s: el.querySelector('#s') as HTMLSelectElement }
}

describe('IvNativeSelect', () => {
  it('renders hooks, slots, the chevron and the size on both wrapper and select', async () => {
    const { fixture, el, w, s } = await setup()
    expect(w.dataset['slot']).toBe('native-select-wrapper')
    expect(w.classList).toContain('w-48')
    expect(s.dataset['slot']).toBe('native-select')
    expect(s.classList).toContain('cn-native-select')
    expect(w.querySelector('[data-slot="native-select-icon"]')?.getAttribute('aria-hidden')).toBe('true')
    expect(el.querySelector('[data-slot="native-select-option"]')).not.toBeNull()
    expect(el.querySelector('[data-slot="native-select-optgroup"]')).not.toBeNull()
    fixture.componentInstance.size.set('sm')
    await fixture.whenStable()
    expect(w.dataset['size']).toBe('sm')
    expect(s.dataset['size']).toBe('sm')
    expect((el.querySelector('#bare') as HTMLElement).dataset['size']).toBe('default')
  })

  it('works with reactive forms and ngModel', async () => {
    const { fixture, el, s } = await setup()
    expect(s.value).toBe('pear')
    s.value = 'apple'
    s.dispatchEvent(new Event('change'))
    expect(fixture.componentInstance.control.value).toBe('apple')
    fixture.componentInstance.control.disable()
    await fixture.whenStable()
    expect(s.disabled).toBe(true)
    const bare = el.querySelector('#bare') as HTMLSelectElement
    bare.value = 'b'
    bare.dispatchEvent(new Event('change'))
    expect(fixture.componentInstance.bare).toBe('b')
  })

  it('has no axe violations', async () => {
    const { el } = await setup()
    await expect(el).toHaveNoViolations()
  })
})

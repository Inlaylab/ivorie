import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Overlay } from '@angular/cdk/overlay'
import { describe, expect, it, vi } from 'vitest'
import { IV_COMBOBOX_IMPORTS } from '@inlaylab/ivorie/combobox'

const ITEMS = `
  <iv-combobox-content>
    <iv-combobox-list>
      <iv-combobox-item value="apple" label="Apple">Apple</iv-combobox-item>
      <iv-combobox-item value="banana" label="Banana" [disabled]="true">Banana</iv-combobox-item>
      <iv-combobox-item value="cherry" label="Cherry">Cherry</iv-combobox-item>
      <iv-combobox-empty>No fruit.</iv-combobox-empty>
    </iv-combobox-list>
  </iv-combobox-content>
`

@Component({
  imports: [IV_COMBOBOX_IMPORTS, FormsModule],
  template: `
    <iv-combobox [(ngModel)]="fruit" (valueChange)="changes.push($event)" (searchSubmit)="submits.push($event)">
      <iv-combobox-input aria-label="Fruit" class="mt-1" />
      ${ITEMS}
    </iv-combobox>
  `,
})
class SingleModelHost {
  fruit = signal<string | null>(null)
  changes: unknown[] = []
  submits: string[] = []
}

@Component({
  imports: [IV_COMBOBOX_IMPORTS, ReactiveFormsModule],
  template: `
    <iv-combobox [formControl]="control" [disabled]="disabled()" (valueChange)="changes.push($event)">
      <iv-combobox-input aria-label="Fruit" />
      ${ITEMS}
    </iv-combobox>
  `,
})
class SingleFormHost {
  control = new FormControl<string | null>(null)
  disabled = signal(false)
  changes: unknown[] = []
}

@Component({
  imports: [IV_COMBOBOX_IMPORTS, FormsModule],
  template: `
    <iv-combobox [multiple]="true" [(ngModel)]="fruits" (valueChange)="changes.push($event)">
      <iv-combobox-chips aria-label="Fruits">
        @for (v of fruits(); track v) {
          <iv-combobox-chip [value]="v" [label]="v" />
        }
      </iv-combobox-chips>
      ${ITEMS}
    </iv-combobox>
  `,
})
class MultiModelHost {
  fruits = signal<string[]>([])
  changes: unknown[] = []
}

@Component({
  imports: [IV_COMBOBOX_IMPORTS, ReactiveFormsModule],
  template: `
    <iv-combobox [multiple]="true" [formControl]="control" [disabled]="disabled()" (valueChange)="changes.push($event)">
      <iv-combobox-chips aria-label="Fruits" />
      ${ITEMS}
    </iv-combobox>
  `,
})
class MultiFormHost {
  control = new FormControl<string[]>([], { nonNullable: true })
  disabled = signal(false)
  changes: unknown[] = []
}

@Component({
  imports: [IV_COMBOBOX_IMPORTS, FormsModule],
  template: `
    <iv-combobox [(ngModel)]="fruit">
      <iv-combobox-input aria-label="Fruit" />
      <iv-combobox-content>
        <iv-combobox-list>
          @for (f of items(); track f.value) {
            <iv-combobox-item [value]="f.value" [label]="f.label">{{ f.label }}</iv-combobox-item>
          }
        </iv-combobox-list>
      </iv-combobox-content>
    </iv-combobox>
  `,
})
class ReloadHost {
  fruit = signal<string | null>('apple')
  items = signal([{ value: 'apple', label: 'Apple' }, { value: 'cherry', label: 'Cherry' }])
}

@Component({
  imports: [IV_COMBOBOX_IMPORTS],
  template: `
    <label for="fruit">Fruit</label>
    <iv-combobox>
      <iv-combobox-input id="fruit" />
      ${ITEMS}
    </iv-combobox>
    <label for="fruits">Fruits</label>
    <iv-combobox [multiple]="true">
      <iv-combobox-chips id="fruits" />
      ${ITEMS}
    </iv-combobox>
  `,
})
class LabelHost {}

async function render<T>(host: new () => T) {
  const create = vi.spyOn(TestBed.inject(Overlay), 'create')
  const fixture = TestBed.createComponent(host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const input = el.querySelector('input[role="combobox"]') as HTMLInputElement
  const stable = () => fixture.whenStable()
  const key = async (key: string) => {
    // The CDK key manager reads keyCode.
    const keyCode = { ArrowUp: 38, ArrowDown: 40, Enter: 13, Escape: 27, Backspace: 8 }[key] ?? 0
    const event = new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true })
    input.dispatchEvent(event)
    await stable()
    return event
  }
  const open = async () => {
    input.dispatchEvent(new Event('focus'))
    await stable()
  }
  const type = async (text: string) => {
    input.value = text
    input.dispatchEvent(new Event('input'))
    await stable()
  }
  const panel = () => document.querySelector('[data-slot="combobox-content"]') as HTMLElement | null
  const item = (value: string) => document.querySelector(`[data-slot="combobox-item"][data-value="${value}"]`) as HTMLElement
  const active = () => input.getAttribute('aria-activedescendant')
  return { fixture, el, input, key, open, type, panel, item, active, stable, create, host: fixture.componentInstance }
}

describe('IvCombobox', () => {
  it('carries hooks and data-slots', async () => {
    const { el, input, open, panel, item, host, fixture } = await render(SingleModelHost)
    const group = el.querySelector('iv-combobox-input') as HTMLElement
    expect(group.dataset['slot']).toBe('input-group')
    expect(group.classList).toContain('cn-combobox-input')
    expect(group.classList).toContain('mt-1')
    expect(group.hasAttribute('aria-label')).toBe(false)
    expect(input.getAttribute('aria-label')).toBe('Fruit')
    expect(input.dataset['slot']).toBe('input-group-control')
    expect(el.querySelector('[data-slot="combobox-trigger"] button')!.classList).toContain('cn-combobox-trigger')
    expect(el.querySelector('.cn-combobox-trigger-icon')).not.toBeNull()

    host.fruit.set('apple')
    await fixture.whenStable()
    await open()
    expect(panel()!.classList).toContain('cn-combobox-content')
    expect(panel()!.classList).toContain('cn-menu-target')
    const list = panel()!.querySelector('[data-slot="combobox-list"]')!
    expect(list.classList).toContain('cn-combobox-list')
    // A custom element is inline by default; its padding then adds empty line boxes above and below the items.
    expect(list.classList).toContain('block')
    expect(list.getAttribute('role')).toBe('listbox')
    expect(input.getAttribute('aria-controls')).toBe(list.id)
    expect(item('apple').classList).toContain('cn-combobox-item')
    expect(item('apple').getAttribute('aria-selected')).toBe('true')
    expect(item('apple').querySelector('.cn-combobox-item-indicator')).not.toBeNull()
    expect(item('cherry').querySelector('.cn-combobox-item-indicator')).toBeNull()
    expect(panel()!.querySelector('.cn-combobox-empty')!.hasAttribute('hidden')).toBe(true)
  })

  it('creates no overlay before the first open', async () => {
    const { open, create, panel } = await render(SingleModelHost)
    expect(create).not.toHaveBeenCalled()
    expect(panel()).toBeNull()
    await open()
    expect(create).toHaveBeenCalledTimes(1)
    expect(panel()).not.toBeNull()
  })

  it('ngModel → view, click → model, emits once', async () => {
    const { fixture, input, open, item, panel, host } = await render(SingleModelHost)
    host.fruit.set('cherry')
    await fixture.whenStable()
    expect(input.value).toBe('Cherry')
    await open()
    item('apple').click()
    await fixture.whenStable()
    expect(host.fruit()).toBe('apple')
    expect(host.changes).toEqual(['apple'])
    expect(input.value).toBe('Apple')
    expect(panel()).toBeNull()
  })

  it('typing filters; no match shows the empty state, clears the active item, Enter submits', async () => {
    const { open, type, key, item, panel, active, host } = await render(SingleModelHost)
    await open()
    await key('ArrowDown')
    expect(active()).toBe(item('apple').id)
    await type('ch')
    expect(item('apple').hidden).toBe(true)
    expect(item('cherry').hidden).toBe(false)
    expect(active()).toBeNull()
    await type('zz')
    expect(item('cherry').hidden).toBe(true)
    expect(panel()!.querySelector('.cn-combobox-empty')!.hasAttribute('hidden')).toBe(false)
    expect(panel()!.dataset['empty']).toBe('')
    expect((await key('ArrowDown')).defaultPrevented).toBe(true)
    expect(active()).toBeNull()
    await key('Enter')
    expect(host.submits).toEqual(['zz'])
    expect(host.changes).toEqual([])
  })

  it('arrows skip hidden and disabled items; Enter selects and closes', async () => {
    const { key, type, item, active, panel, host } = await render(SingleModelHost)
    await key('ArrowDown')
    expect(panel()).not.toBeNull()
    expect(active()).toBe(item('apple').id)
    expect(item('apple').dataset['highlighted']).toBe('')
    await key('ArrowDown')
    expect(active()).toBe(item('cherry').id)
    await type('rr')
    await key('ArrowDown')
    expect(active()).toBe(item('cherry').id)
    await key('Enter')
    expect(host.fruit()).toBe('cherry')
    expect(host.changes).toEqual(['cherry'])
    expect(panel()).toBeNull()
  })

  it('Escape closes and marks touched', async () => {
    const { open, key, panel, host } = await render(SingleFormHost)
    await open()
    expect(host.control.touched).toBe(false)
    expect((await key('Escape')).defaultPrevented).toBe(true)
    expect(panel()).toBeNull()
    expect(host.control.touched).toBe(true)
  })

  it('setValue updates the view and does not emit', async () => {
    const { fixture, input, host } = await render(SingleFormHost)
    const onChange = vi.fn()
    host.control.valueChanges.subscribe(onChange)
    host.control.setValue('cherry')
    await fixture.whenStable()
    expect(input.value).toBe('Cherry')
    expect(host.changes).toEqual([])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('stays disabled when the form disables it, even if [disabled] changes', async () => {
    const { fixture, input, open, panel, host } = await render(SingleFormHost)
    host.control.disable()
    await fixture.whenStable()
    expect(input.disabled).toBe(true)
    host.disabled.set(true)
    await fixture.whenStable()
    host.disabled.set(false)
    await fixture.whenStable()
    expect(input.disabled).toBe(true)
    await open()
    expect(panel()).toBeNull()
    host.control.enable()
    await fixture.whenStable()
    expect(input.disabled).toBe(false)
  })

  it('Enter after a pick keeps the label', async () => {
    const { el, input, key, panel, host, fixture } = await render(SingleModelHost)
    await key('ArrowDown')
    await key('Enter')
    expect(host.fruit()).toBe('apple')
    expect(panel()).toBeNull()
    await key('Enter')
    expect(input.value).toBe('Apple')
    expect(host.submits).toEqual([])
    // Open with the trigger: no active item, the search is the selected label.
    ;(el.querySelector('[data-slot="combobox-trigger"] button') as HTMLElement).click()
    await fixture.whenStable()
    expect(panel()).not.toBeNull()
    await key('Enter')
    expect(input.value).toBe('Apple')
    expect(host.submits).toEqual([])
    expect(host.fruit()).toBe('apple')
  })

  it("clearing the search plus an items reload keeps ''", async () => {
    const { input, type, fixture, host } = await render(ReloadHost)
    expect(input.value).toBe('Apple')
    await type('')
    host.items.set([{ value: 'apple', label: 'Apple' }, { value: 'cherry', label: 'Cherry' }, { value: 'fig', label: 'Fig' }])
    await fixture.whenStable()
    expect(input.value).toBe('')
  })

  it('label[for] targets the inner input', async () => {
    const fixture = TestBed.createComponent(LabelHost)
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    for (const id of ['fruit', 'fruits']) {
      expect(el.querySelectorAll(`#${id}`).length).toBe(1)
      const input = el.querySelector(`#${id}`) as HTMLInputElement
      expect(input.tagName).toBe('INPUT')
      // jsdom does not focus on a label click; label.control is the element a click would focus.
      expect((el.querySelector(`label[for="${id}"]`) as HTMLLabelElement).control).toBe(input)
    }
    fixture.destroy()
  })

  it('destroys the key manager when the component is destroyed (H2: it owns an effect on the items signal that would otherwise keep running)', async () => {
    const destroy = vi.spyOn(ActiveDescendantKeyManager.prototype, 'destroy')
    const { fixture } = await render(SingleModelHost)
    expect(destroy).not.toHaveBeenCalled()
    fixture.destroy()
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations', async () => {
    const { el } = await render(SingleModelHost)
    await expect(el).toHaveNoViolations()
  })

  describe('multiple', () => {
    it('adds and removes chips; Backspace removes the last one', async () => {
      const { fixture, el, open, item, panel, key, host } = await render(MultiModelHost)
      expect(el.querySelector('[data-slot="combobox-chips"]')!.classList).toContain('cn-combobox-chips')
      await open()
      item('apple').click()
      await fixture.whenStable()
      item('cherry').click()
      await fixture.whenStable()
      expect(host.fruits()).toEqual(['apple', 'cherry'])
      expect(panel()).not.toBeNull()
      const chips = el.querySelectorAll('[data-slot="combobox-chip"]')
      expect(chips.length).toBe(2)
      expect(chips[0].classList).toContain('cn-combobox-chip')
      ;(chips[0].querySelector('[data-slot="combobox-chip-remove"]') as HTMLElement).click()
      await fixture.whenStable()
      expect(host.fruits()).toEqual(['cherry'])
      await key('Backspace')
      expect(host.fruits()).toEqual([])
      expect(host.changes).toEqual([['apple'], ['apple', 'cherry'], ['cherry'], []])
    })

    it('ngModel → view: selected items are marked', async () => {
      const { fixture, open, item, host } = await render(MultiModelHost)
      host.fruits.set(['cherry'])
      await fixture.whenStable()
      await open()
      expect(item('cherry').getAttribute('aria-selected')).toBe('true')
      expect(item('apple').getAttribute('aria-selected')).toBe('false')
    })

    it('setValue does not emit; close marks touched', async () => {
      const { fixture, open, key, item, host } = await render(MultiFormHost)
      host.control.setValue(['apple'])
      await fixture.whenStable()
      await open()
      expect(item('apple').getAttribute('aria-selected')).toBe('true')
      expect(host.changes).toEqual([])
      await key('Escape')
      expect(host.control.touched).toBe(true)
    })

    it('stays disabled when the form disables it, even if [disabled] changes', async () => {
      const { fixture, input, host } = await render(MultiFormHost)
      host.control.disable()
      await fixture.whenStable()
      host.disabled.set(true)
      await fixture.whenStable()
      host.disabled.set(false)
      await fixture.whenStable()
      expect(input.disabled).toBe(true)
    })

    it('has no axe violations', async () => {
      const { el } = await render(MultiModelHost)
      await expect(el).toHaveNoViolations()
    })
  })
})

@Component({
  imports: [IV_COMBOBOX_IMPORTS, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <iv-combobox formControlName="fruit">
        <iv-combobox-input aria-label="Fruit" />
        <iv-combobox-content>
          <iv-combobox-list>
            @for (f of fruits; track f.value) {
              <iv-combobox-item [value]="f.value" [label]="f.label">{{ f.label }}</iv-combobox-item>
            }
          </iv-combobox-list>
        </iv-combobox-content>
      </iv-combobox>
    </form>
  `,
})
class LoopFormHost {
  fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'cherry', label: 'Cherry' },
  ]
  form = new FormGroup({ fruit: new FormControl<string | null>('cherry') })
}

describe('IvCombobox items from @for with bound values (reactive form)', () => {
  it('renders and shows the selected label', async () => {
    const fixture = TestBed.createComponent(LoopFormHost)
    await fixture.whenStable()
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('Cherry')
  })
})

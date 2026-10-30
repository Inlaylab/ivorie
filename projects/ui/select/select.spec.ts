import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it, vi } from 'vitest'
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select'

@Component({
  imports: [IV_SELECT_IMPORTS, FormsModule],
  template: `
    <label for="fruit">Fruit</label>
    <iv-select [(ngModel)]="fruit" (valueChange)="changes.push($event)">
      <iv-select-trigger id="fruit" size="sm" class="w-full" />
      <iv-select-content>
        <iv-select-group>
          <iv-select-label>Fruits</iv-select-label>
          <iv-select-item value="apple">Apple</iv-select-item>
          <iv-select-item value="avocado" [disabled]="true">Avocado</iv-select-item>
          <iv-select-item value="banana">Banana</iv-select-item>
        </iv-select-group>
        <iv-select-separator />
        <iv-select-item value="cherry">Cherry</iv-select-item>
      </iv-select-content>
    </iv-select>
  `,
})
class ModelHost {
  fruit = signal<string | null>(null)
  changes: (string | null)[] = []
}

@Component({
  imports: [IV_SELECT_IMPORTS, ReactiveFormsModule],
  template: `
    <iv-select [formControl]="control" [disabled]="disabled()" (valueChange)="changes.push($event)">
      <iv-select-trigger aria-label="Fruit" />
      <iv-select-content>
        <iv-select-item value="apple">Apple</iv-select-item>
        <iv-select-item value="banana">Banana</iv-select-item>
      </iv-select-content>
    </iv-select>
  `,
})
class FormHost {
  control = new FormControl<string | null>(null)
  disabled = signal(false)
  changes: (string | null)[] = []
}

@Component({
  imports: [IV_SELECT_IMPORTS],
  template: `
    <iv-select [value]="value()" placeholder="Pick">
      <iv-select-trigger aria-label="Fruit" />
      <iv-select-content>
        @for (item of items(); track item) {
          <iv-select-item [value]="item">{{ item }}</iv-select-item>
        }
      </iv-select-content>
    </iv-select>
  `,
})
class ValueHost {
  value = signal<string | null>(null)
  items = signal(['Apple', 'Banana'])
}

// The item's label changes independently of its value, unlike ValueHost above.
@Component({
  imports: [IV_SELECT_IMPORTS],
  template: `
    <iv-select [value]="'apple'">
      <iv-select-trigger aria-label="Fruit" />
      <iv-select-content>
        <iv-select-item value="apple">{{ label() }}</iv-select-item>
      </iv-select-content>
    </iv-select>
  `,
})
class LabelHost {
  label = signal('Apple')
}

async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host)
  await fixture.whenStable()
  const trigger = fixture.nativeElement.querySelector('[data-slot="select-trigger"]') as HTMLButtonElement
  const key = async (key: string) => {
    // The CDK key manager reads keyCode.
    const keyCode = { ArrowUp: 38, ArrowDown: 40, Home: 36, End: 35 }[key] ?? key.toUpperCase().charCodeAt(0)
    const event = new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true })
    trigger.dispatchEvent(event)
    await fixture.whenStable()
    return event
  }
  const listbox = () => document.querySelector('[role="listbox"]') as HTMLElement | null
  const option = (text: string) =>
    [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === text)!
  const active = () => document.getElementById(trigger.getAttribute('aria-activedescendant') ?? '')?.textContent?.trim()
  const text = () => trigger.querySelector('[data-slot="select-value"]')!.textContent!.trim()
  return { fixture, trigger, key, listbox, option, active, text, host: fixture.componentInstance }
}

describe('IvSelect', () => {
  it('trigger is a native button with hooks, size and forwarded id', async () => {
    const { fixture, trigger, text } = await render(ModelHost)
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.getAttribute('type')).toBe('button')
    expect(trigger.getAttribute('role')).toBe('combobox')
    expect(trigger.id).toBe('fruit')
    expect(fixture.nativeElement.querySelectorAll('#fruit').length).toBe(1)
    expect(trigger.classList).toContain('cn-select-trigger')
    expect(trigger.classList).toContain('w-full')
    expect(trigger.dataset['size']).toBe('sm')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
    expect(trigger.querySelector('svg')!.classList).toContain('cn-select-trigger-icon')
    expect(text()).toBe('Select an option')
    expect(trigger.hasAttribute('data-placeholder')).toBe(true)
  })

  it('content carries hooks; listbox, options and parts are wired', async () => {
    const { trigger, key, listbox, option } = await render(ModelHost)
    await key('Enter')
    const lb = listbox()!
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(lb.id)
    expect(lb.classList).toContain('cn-select-viewport')
    const content = lb.closest('[data-slot="select-content"]')!
    for (const hook of ['cn-select-content', 'cn-menu-target', 'cn-menu-translucent']) expect(content.classList).toContain(hook)
    expect(document.querySelector('[data-slot="select-group"]')!.classList).toContain('cn-select-group')
    expect(document.querySelector('[data-slot="select-label"]')!.classList).toContain('cn-select-label')
    expect(document.querySelector('[data-slot="select-separator"]')!.classList).toContain('cn-select-separator')
    const apple = option('Apple')
    expect(apple.classList).toContain('cn-select-item')
    expect(apple.querySelector('.cn-select-item-indicator')).not.toBeNull()
    expect(option('Avocado').getAttribute('aria-disabled')).toBe('true')
  })

  it('ngModel → view; click item → model, emits once, closes', async () => {
    const { fixture, trigger, option, listbox, text, host } = await render(ModelHost)
    host.fruit.set('banana')
    await fixture.whenStable()
    expect(text()).toBe('Banana')
    trigger.click()
    await fixture.whenStable()
    expect(option('Banana').getAttribute('aria-selected')).toBe('true')
    expect(option('Banana').querySelector('.cn-select-item-indicator-icon')).not.toBeNull()
    option('Cherry').click()
    await fixture.whenStable()
    expect(host.fruit()).toBe('cherry')
    expect(host.changes).toEqual(['cherry'])
    expect(listbox()).toBeNull()
    expect(text()).toBe('Cherry')
  })

  it('ArrowDown opens on the first item; arrows skip a disabled item; Enter selects and closes', async () => {
    const { trigger, key, active, listbox, host } = await render(ModelHost)
    trigger.focus()
    await key('ArrowDown')
    expect(listbox()).not.toBeNull()
    expect(active()).toBe('Apple')
    await key('ArrowDown')
    expect(active()).toBe('Banana')
    await key('ArrowUp')
    expect(active()).toBe('Apple')
    await key('End')
    expect(active()).toBe('Cherry')
    await key('Home')
    expect(active()).toBe('Apple')
    await key('ArrowDown')
    expect((await key('Enter')).defaultPrevented).toBe(true)
    expect(host.fruit()).toBe('banana')
    expect(host.changes).toEqual(['banana'])
    expect(listbox()).toBeNull()
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('opening starts on the selected item', async () => {
    const { fixture, key, active, host } = await render(ModelHost)
    host.fruit.set('cherry')
    await fixture.whenStable()
    await key('Enter')
    expect(active()).toBe('Cherry')
  })

  it('Escape closes and focus stays on the trigger', async () => {
    const { trigger, key, listbox, host } = await render(ModelHost)
    trigger.focus()
    await key('Enter')
    expect((await key('Escape')).defaultPrevented).toBe(true)
    expect(listbox()).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(host.changes).toEqual([])
  })

  it('Tab closes the list', async () => {
    const { key, listbox } = await render(ModelHost)
    await key('Enter')
    expect((await key('Tab')).defaultPrevented).toBe(false)
    expect(listbox()).toBeNull()
  })

  it('typeahead "b" jumps to Banana', async () => {
    const { fixture, key, active } = await render(ModelHost)
    await key('Enter')
    await key('b')
    await new Promise((r) => setTimeout(r, 300))
    await fixture.whenStable()
    expect(active()).toBe('Banana')
  })

  it('an empty list opens without throwing; keys select nothing', async () => {
    const { fixture, key, listbox, host } = await render(ValueHost)
    host.items.set([])
    await fixture.whenStable()
    await key('ArrowDown')
    expect(listbox()).not.toBeNull()
    await key('ArrowDown')
    await key('Enter')
    expect(listbox()).not.toBeNull()
  })

  it('[value] from the parent updates the label', async () => {
    const { fixture, text, host } = await render(ValueHost)
    expect(text()).toBe('Pick')
    host.value.set('Banana')
    await fixture.whenStable()
    expect(text()).toBe('Banana')
  })

  it('setValue updates the view and does not emit', async () => {
    const { fixture, text, host } = await render(FormHost)
    const onChange = vi.fn()
    host.control.valueChanges.subscribe(onChange)
    host.control.setValue('apple')
    await fixture.whenStable()
    expect(text()).toBe('Apple')
    expect(host.changes).toEqual([])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('stays disabled when the form disables it, even if [disabled] changes', async () => {
    const { fixture, trigger, listbox, host } = await render(FormHost)
    host.control.disable()
    await fixture.whenStable()
    expect(trigger.disabled).toBe(true)
    host.disabled.set(true)
    await fixture.whenStable()
    host.disabled.set(false)
    await fixture.whenStable()
    expect(trigger.disabled).toBe(true)
    trigger.click()
    await fixture.whenStable()
    expect(listbox()).toBeNull()
    host.control.enable()
    await fixture.whenStable()
    expect(trigger.disabled).toBe(false)
  })

  it('closing marks the control touched', async () => {
    const { key, host } = await render(FormHost)
    await key('Enter')
    expect(host.control.touched).toBe(false)
    await key('Escape')
    expect(host.control.touched).toBe(true)
  })

  it('a selected item label that changes after render updates the trigger text (H6)', async () => {
    const { fixture, text, host } = await render(LabelHost)
    expect(text()).toBe('Apple')
    host.label.set('Red Apple')
    await fixture.whenStable()
    expect(text()).toBe('Red Apple')
  })

  it('destroys the key manager when the component is destroyed (H2: it owns an effect on the items signal that would otherwise keep running)', async () => {
    const destroy = vi.spyOn(ActiveDescendantKeyManager.prototype, 'destroy')
    const { fixture } = await render(ModelHost)
    expect(destroy).not.toHaveBeenCalled()
    fixture.destroy()
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations', async () => {
    const { fixture } = await render(ModelHost)
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

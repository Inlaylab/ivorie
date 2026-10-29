import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it, vi } from 'vitest'
import { IV_RADIO_GROUP_IMPORTS } from '@ivorie/ui/radio-group'

@Component({
  imports: [IV_RADIO_GROUP_IMPORTS, FormsModule],
  template: `
    <iv-radio-group aria-label="Plan" [(ngModel)]="plan" (valueChange)="changes.push($event)" orientation="vertical" class="gap-1">
      <label for="a">A</label>
      <iv-radio-group-item id="a" value="a" class="ml-1" />
      <label for="b">B</label>
      <iv-radio-group-item id="b" value="b" [disabled]="bDisabled()" />
      <label for="c">C</label>
      <iv-radio-group-item id="c" value="c" />
    </iv-radio-group>
  `,
})
class ModelHost {
  plan = signal<string | null>(null)
  bDisabled = signal(false)
  changes: (string | null)[] = []
}

@Component({
  imports: [IV_RADIO_GROUP_IMPORTS, ReactiveFormsModule],
  template: `
    <iv-radio-group aria-label="Plan" [formControl]="control" [disabled]="disabled()" (valueChange)="changes.push($event)">
      <iv-radio-group-item aria-label="A" value="a" />
      <iv-radio-group-item aria-label="B" value="b" />
    </iv-radio-group>
  `,
})
class FormHost {
  control = new FormControl<string | null>(null)
  disabled = signal(false)
  changes: (string | null)[] = []
}

async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const group = el.querySelector('[data-slot="radio-group"]') as HTMLElement
  const items = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[data-slot="radio-group-item"]'))
  const key = async (target: HTMLElement, key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    await fixture.whenStable()
    return event
  }
  return { fixture, el, group, items, key, host: fixture.componentInstance }
}

describe('IvRadioGroup', () => {
  it('carries hooks, roles, orientation and the user class', async () => {
    const { group, items } = await render(ModelHost)
    expect(group.getAttribute('role')).toBe('radiogroup')
    expect(group.getAttribute('aria-orientation')).toBe('vertical')
    expect(group.classList).toContain('cn-radio-group')
    expect(group.classList).toContain('gap-1')
    const [a] = items()
    expect(a.tagName).toBe('BUTTON')
    expect(a.getAttribute('type')).toBe('button')
    expect(a.getAttribute('role')).toBe('radio')
    expect(a.id).toBe('a')
    expect(a.classList).toContain('cn-radio-group-item')
    expect(a.classList).toContain('ml-1')
    expect(a.getAttribute('aria-checked')).toBe('false')
  })

  it('shows the indicator only on the checked item', async () => {
    const { fixture, items, host } = await render(ModelHost)
    expect(fixture.nativeElement.querySelector('[data-slot="radio-group-indicator"]')).toBeNull()
    host.plan.set('c')
    await fixture.whenStable()
    const c = items()[2]
    const indicator = c.querySelector('[data-slot="radio-group-indicator"]')!
    expect(indicator.classList).toContain('cn-radio-group-indicator')
    expect(indicator.querySelector('.cn-radio-group-indicator-icon')).not.toBeNull()
    expect(c.hasAttribute('data-checked')).toBe(true)
  })

  it('ngModel → view, click → model, emits once', async () => {
    const { fixture, items, host } = await render(ModelHost)
    host.plan.set('b')
    await fixture.whenStable()
    expect(items()[1].getAttribute('aria-checked')).toBe('true')
    items()[0].click()
    await fixture.whenStable()
    expect(host.plan()).toBe('a')
    expect(host.changes).toEqual(['a'])
  })

  it('a label click selects its item', async () => {
    const { fixture, el, host } = await render(ModelHost)
    ;(el.querySelectorAll('label')[2] as HTMLElement).click()
    await fixture.whenStable()
    expect(host.plan()).toBe('c')
  })

  it('only one tabindex="0": the checked item, else the first enabled', async () => {
    const { fixture, items, host } = await render(ModelHost)
    const stops = () => items().map((i) => i.getAttribute('tabindex'))
    expect(stops()).toEqual(['0', '-1', '-1'])
    host.plan.set('c')
    await fixture.whenStable()
    expect(stops()).toEqual(['-1', '-1', '0'])
  })

  it('arrow down/right moves focus and selects', async () => {
    const { fixture, el, items, key, host } = await render(ModelHost)
    items()[0].focus()
    await key(items()[0], 'ArrowDown')
    expect(el.ownerDocument.activeElement).toBe(items()[1])
    expect(host.plan()).toBe('b')
    await key(items()[1], 'ArrowRight')
    expect(el.ownerDocument.activeElement).toBe(items()[2])
    expect(host.plan()).toBe('c')
    await key(items()[2], 'ArrowUp')
    expect(host.plan()).toBe('b')
    expect(host.changes).toEqual(['b', 'c', 'b'])
    await fixture.whenStable()
  })

  it('wraps at the end and skips a disabled item', async () => {
    const { fixture, el, items, key, host } = await render(ModelHost)
    host.bDisabled.set(true)
    host.plan.set('c')
    await fixture.whenStable()
    items()[2].focus()
    expect((await key(items()[2], 'ArrowDown')).defaultPrevented).toBe(true)
    expect(el.ownerDocument.activeElement).toBe(items()[0])
    expect(host.plan()).toBe('a')
    await key(items()[0], 'ArrowRight')
    expect(host.plan()).toBe('c')
    await key(items()[2], 'ArrowLeft')
    expect(host.plan()).toBe('a')
  })

  // Space activates the native button (a click). Enter must not, like Radix.
  it('Enter does not select', async () => {
    const { items, key, host } = await render(ModelHost)
    expect((await key(items()[1], 'Enter')).defaultPrevented).toBe(true)
    expect(host.plan()).toBeNull()
  })

  it('setValue updates the view and does not emit', async () => {
    const { fixture, items, host } = await render(FormHost)
    const onChange = vi.fn()
    host.control.valueChanges.subscribe(onChange)
    host.control.setValue('b')
    await fixture.whenStable()
    expect(items()[1].getAttribute('aria-checked')).toBe('true')
    expect(host.changes).toEqual([])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('stays disabled when the form disables it, even if [disabled] changes', async () => {
    const { fixture, group, items, host } = await render(FormHost)
    host.control.disable()
    await fixture.whenStable()
    expect(items().every((i) => i.disabled)).toBe(true)
    expect(group.hasAttribute('data-disabled')).toBe(true)
    host.disabled.set(true)
    await fixture.whenStable()
    host.disabled.set(false)
    await fixture.whenStable()
    expect(items().every((i) => i.disabled)).toBe(true)
    items()[0].click()
    expect(host.control.value).toBeNull()
    host.control.enable()
    await fixture.whenStable()
    expect(items()[0].disabled).toBe(false)
  })

  it('blur marks the control touched', async () => {
    const { fixture, items, host } = await render(FormHost)
    items()[0].dispatchEvent(new FocusEvent('blur'))
    await fixture.whenStable()
    expect(host.control.touched).toBe(true)
  })

  it('has no axe violations', async () => {
    const { fixture, host } = await render(ModelHost)
    host.plan.set('a')
    await fixture.whenStable()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

@Component({
  imports: [IV_RADIO_GROUP_IMPORTS],
  template: `
    <iv-radio-group aria-label="Plan" [(value)]="plan">
      @for (o of options; track o) {
        <iv-radio-group-item [aria-label]="o" [value]="o" />
      }
    </iv-radio-group>
  `,
})
class LoopHost {
  options = ['a', 'b', 'c']
  plan = signal<string | null>('b')
}

describe('IvRadioGroup items from @for with bound values', () => {
  it('renders and puts the tab stop on the checked item', async () => {
    const { items } = await render(LoopHost)
    expect(items().map((i) => i.tabIndex)).toEqual([-1, 0, -1])
  })
})

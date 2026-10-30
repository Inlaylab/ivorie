import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Subject } from 'rxjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DialogCloseEvent, IvDialog } from '@inlaylab/ivorie/dialog'
import { fitChips } from './chip-fit'
import { IvSelectPicker } from './select-picker'

interface Group {
  id: string
  name: string
}

const groups: Group[] = [
  { id: 'g1', name: 'Engineering' },
  { id: 'g2', name: 'Sales' },
  { id: 'g3', name: 'Support engineers' },
]
const byId = (g: Group) => g.id
const byName = (g: Group) => g.name

describe('fitChips', () => {
  it('shows every chip when they all fit', () => expect(fitChips(500, [100, 100, 100], 60)).toBe(3))
  it('collapses the overflow when they do not', () => expect(fitChips(300, [100, 100, 100], 60)).toBe(1))
  it('always keeps at least one chip', () => expect(fitChips(50, [100, 100, 100], 60)).toBe(1))
  it('does not reserve overflow room for the final chip', () => expect(fitChips(300, [100, 100], 60)).toBe(2))
  it('is 0 with no chips', () => expect(fitChips(300, [], 60)).toBe(0))
  it('shows all before layout', () => {
    expect(fitChips(0, [100, 100, 100], 60)).toBe(3)
    expect(fitChips(300, [], 60, 3)).toBe(3)
  })
})

/** Fake dialog: each open() returns a subject the test closes. */
function fakeDialog() {
  const closes: Subject<DialogCloseEvent<string[]>>[] = []
  const open = vi.fn(() => {
    const closed = new Subject<DialogCloseEvent<string[]>>()
    closes.push(closed)
    return { afterClosed: () => closed.asObservable() }
  })
  const close = (result?: string[]) => {
    const closed = closes.at(-1)!
    closed.next({ reason: result ? 'close-button' : 'escape', result })
    closed.complete()
  }
  return { open, close }
}

@Component({
  imports: [IvSelectPicker, FormsModule],
  template: `
    <label for="groups">Groups</label>
    <iv-select-picker
      id="groups"
      class="extra"
      [items]="items()"
      [valueFn]="byId"
      [labelFn]="byName"
      [(ngModel)]="value"
      (selectionChange)="changes.push($event)"
    />
  `,
})
class ModelHost {
  items = signal<Group[]>(groups)
  value = signal<string[]>([])
  changes: string[][] = []
  byId = byId
  byName = byName
}

@Component({
  imports: [IvSelectPicker, ReactiveFormsModule],
  template: `
    <iv-select-picker
      ariaLabel="Groups"
      [items]="items"
      [valueFn]="byId"
      [labelFn]="byName"
      [formControl]="control"
      [disabled]="disabled()"
      (selectionChange)="changes.push($event)"
    />
  `,
})
class FormHost {
  items = groups
  control = new FormControl<string[]>([], { nonNullable: true })
  disabled = signal(false)
  changes: string[][] = []
  byId = byId
  byName = byName
}

async function render<T>(host: new () => T) {
  const dialog = fakeDialog()
  TestBed.configureTestingModule({ providers: [{ provide: IvDialog, useValue: dialog }] })
  const fixture = TestBed.createComponent(host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const trigger = el.querySelector<HTMLButtonElement>('iv-select-picker button')!
  const stable = async () => {
    await fixture.whenStable()
    await new Promise((r) => setTimeout(r))
    await fixture.whenStable()
  }
  const chips = () =>
    Array.from(el.querySelectorAll<HTMLElement>('[data-slot="select-picker-chip"]')).map((c) => c.textContent!.trim())
  return { fixture, host: fixture.componentInstance, el, trigger, dialog, stable, chips }
}

describe('IvSelectPicker', () => {
  afterEach(() => vi.restoreAllMocks())

  it('trigger: select hooks, user class, forwarded id, dialog popup', async () => {
    const { el, trigger } = await render(ModelHost)
    expect(trigger.classList).toContain('cn-select-trigger')
    expect(trigger.classList).toContain('extra')
    expect(trigger.dataset['size']).toBe('default')
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.id).toBe('groups')
    expect(el.querySelectorAll('#groups').length).toBe(1)
    expect(trigger.textContent).toContain('Select…')
  })

  it('no id given: the button has no id attribute', async () => {
    const { trigger } = await render(FormHost)
    expect(trigger.hasAttribute('id')).toBe(false)
  })

  it('label[for] click opens the picker', async () => {
    const { el, dialog } = await render(ModelHost)
    el.querySelector('label')!.click()
    expect(dialog.open).toHaveBeenCalledTimes(1)
  })

  it('ngModel → chips with the cn-combobox-chip hook, in value order', async () => {
    const { host, stable, chips, el } = await render(ModelHost)
    host.value.set(['g2', 'g1'])
    await stable()
    expect(chips()).toEqual(['Sales', 'Engineering'])
    expect(el.querySelector('[data-slot="select-picker-chip"]')!.classList).toContain('cn-combobox-chip')
  })

  it('a stale value shows its raw text; late items replace it with the label', async () => {
    const { host, stable, chips } = await render(ModelHost)
    host.items.set([])
    host.value.set(['g1', 'ghost'])
    await stable()
    expect(chips()).toEqual(['g1', 'ghost'])
    host.items.set(groups)
    await stable()
    expect(chips()).toEqual(['Engineering', 'ghost'])
  })

  it('setValue → chips, no selectionChange', async () => {
    const { host, stable, chips } = await render(FormHost)
    host.control.setValue(['g3'])
    await stable()
    expect(chips()).toEqual(['Support engineers'])
    expect(host.changes).toEqual([])
  })

  it('Save: model + selectionChange once, touched on close, not on open', async () => {
    const { host, trigger, dialog, stable, chips } = await render(FormHost)
    trigger.click()
    await stable()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(host.control.touched).toBe(false)
    const data = (dialog.open.mock.calls[0] as unknown[])[1] as { data: { rows: unknown[]; selectedValues: string[] } }
    expect(data.data.rows.length).toBe(3)
    dialog.close(['g1', 'g3'])
    await stable()
    expect(host.control.value).toEqual(['g1', 'g3'])
    expect(host.changes).toEqual([['g1', 'g3']])
    expect(host.control.touched).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(chips()).toEqual(['Engineering', 'Support engineers'])
  })

  it('Cancel: nothing changes, nothing emitted, touched set', async () => {
    const { host, trigger, dialog, stable } = await render(FormHost)
    host.control.setValue(['g2'])
    trigger.click()
    await stable()
    dialog.close()
    await stable()
    expect(host.control.value).toEqual(['g2'])
    expect(host.changes).toEqual([])
    expect(host.control.touched).toBe(true)
  })

  it('form-disabled stays disabled when [disabled] goes true → false', async () => {
    const { host, trigger, dialog, stable } = await render(FormHost)
    host.control.disable()
    await stable()
    expect(trigger.disabled).toBe(true)
    host.disabled.set(true)
    await stable()
    host.disabled.set(false)
    await stable()
    expect(trigger.disabled).toBe(true)
    trigger.click()
    expect(dialog.open).not.toHaveBeenCalled()
  })

  it('destroy while the dialog is open: no onChange afterwards', async () => {
    const { fixture, host, trigger, dialog, stable } = await render(FormHost)
    trigger.click()
    await stable()
    fixture.destroy()
    dialog.close(['g1'])
    await new Promise((r) => setTimeout(r))
    expect(host.control.value).toEqual([])
    expect(host.changes).toEqual([])
  })

  describe('measuring (jsdom: mocked sizes, DECISIONS 2026-10-27)', () => {
    const observers: FakeResizeObserver[] = []
    class FakeResizeObserver {
      callback: () => void
      disconnect = vi.fn()
      observe = vi.fn()
      constructor(callback: () => void) {
        this.callback = callback
        observers.push(this)
      }
    }
    let triggerWidth = 300

    beforeEach(() => {
      observers.length = 0
      triggerWidth = 300
      vi.stubGlobal('ResizeObserver', FakeResizeObserver)
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
        if (this.hasAttribute('data-measure-chip')) return 100
        if (this.hasAttribute('data-measure-overflow')) return 60
        return 0
      })
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
        return this.tagName === 'BUTTON' ? triggerWidth : 0
      })
    })
    afterEach(() => vi.unstubAllGlobals())

    it('measures only after the new chips have been rendered', async () => {
      const { trigger, dialog, stable, el } = await render(FormHost)
      trigger.click()
      await stable()
      dialog.close(['g1', 'g2', 'g3'])
      await stable()
      expect(el.querySelectorAll('[data-slot="select-picker-chip"]').length).toBe(1)
      expect(el.querySelector('[data-slot="select-picker-more"]')!.textContent!.trim()).toBe('+2 more')
    })

    it('re-flows when the observer reports a resize', async () => {
      const { host, stable, el } = await render(FormHost)
      host.control.setValue(['g1', 'g2', 'g3'])
      await stable()
      expect(el.querySelectorAll('[data-slot="select-picker-chip"]').length).toBe(1)
      triggerWidth = 500
      observers[0].callback()
      await stable()
      expect(el.querySelectorAll('[data-slot="select-picker-chip"]').length).toBe(3)
      expect(el.querySelector('[data-slot="select-picker-more"]')).toBeNull()
    })

    it('new labels with the same fitted count still collapse', async () => {
      const { host, stable, el } = await render(FormHost)
      host.control.setValue(['g1', 'g2', 'g3'])
      await stable()
      expect(el.querySelectorAll('[data-slot="select-picker-chip"]').length).toBe(1)
      host.control.setValue(['g3', 'g2', 'g1'])
      await stable()
      expect(el.querySelectorAll('[data-slot="select-picker-chip"]').length).toBe(1)
      expect(el.querySelector('[data-slot="select-picker-more"]')!.textContent!.trim()).toBe('+2 more')
    })

    it('disconnects the resize observer on destroy', async () => {
      const { fixture } = await render(FormHost)
      expect(observers.length).toBe(1)
      fixture.destroy()
      expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    })

    it('measures from the trigger button width, not the narrower chip row (H7: avoids double-subtracting TRIGGER_CHROME_PX)', async () => {
      // In a real browser the chip row is a flex child already narrowed by the chevron/padding
      // sibling, so its own clientWidth is chrome-free; fitChips must not subtract the chrome again.
      const buttonWidth = 312
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') return buttonWidth
        if (this.dataset['slot'] === 'select-picker-chips') return buttonWidth - 44
        return 0
      })
      const { host, stable, el } = await render(FormHost)
      host.control.setValue(['g1', 'g2', 'g3'])
      await stable()
      expect(el.querySelectorAll('[data-slot="select-picker-chip"]').length).toBe(2)
      expect(el.querySelector('[data-slot="select-picker-more"]')!.textContent!.trim()).toBe('+1 more')
    })

    // afterNextRender never runs on the server; this covers browsers without ResizeObserver.
    it('without ResizeObserver: no observer, no error', async () => {
      vi.stubGlobal('ResizeObserver', undefined)
      const { host, stable, el } = await render(FormHost)
      host.control.setValue(['g1', 'g2', 'g3'])
      await stable()
      expect(observers.length).toBe(0)
      expect(el.querySelectorAll('[data-slot="select-picker-chip"]').length).toBe(1)
    })
  })

  it('axe passes with chips', async () => {
    const { fixture, host, stable } = await render(ModelHost)
    host.value.set(['g1', 'g2'])
    await stable()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

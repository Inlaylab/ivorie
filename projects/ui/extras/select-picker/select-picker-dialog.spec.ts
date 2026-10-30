import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import { IV_DIALOG_DATA, IvDialogRef } from '@ivorie/ui/dialog'
import { SelectPickerDialogData } from './select-picker.model'
import { IvSelectPickerDialog } from './select-picker-dialog'

const baseData = (): SelectPickerDialogData => ({
  rows: [
    { value: 'g1', label: 'Engineering', description: 'Product builders' },
    { value: 'g2', label: 'Sales' },
    { value: 'g3', label: 'Support engineers' },
    { value: '', label: 'Row without a value' },
  ],
  selectedValues: ['g2'],
  title: 'Select groups',
  description: 'Pick some groups',
  searchPlaceholder: 'Search groups',
  valueColumnHeader: 'Group name',
  descriptionColumnHeader: 'Details',
  minSelection: 0,
  emptyMessage: 'No groups found.',
})

async function render(data: Partial<SelectPickerDialogData> = baseData()) {
  const close = vi.fn()
  TestBed.configureTestingModule({
    providers: [
      { provide: IvDialogRef, useValue: { close } },
      { provide: IV_DIALOG_DATA, useValue: data },
    ],
  })
  const fixture = TestBed.createComponent(IvSelectPickerDialog)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const stable = () => fixture.whenStable()
  const search = el.querySelector<HTMLInputElement>('input')!
  const type = async (text: string) => {
    search.value = text
    search.dispatchEvent(new Event('input'))
    await stable()
  }
  const box = (label: string) => el.querySelector<HTMLButtonElement>(`[role="checkbox"][aria-label="${label}"]`)!
  const toggle = async (label: string) => {
    box(label).click()
    await stable()
  }
  const rowLabels = () =>
    Array.from(el.querySelectorAll<HTMLElement>('tbody [role="checkbox"]')).map((b) => b.getAttribute('aria-label'))
  const button = (text: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim() === text)!
  const count = () => el.querySelector('[aria-live="polite"]')!.textContent!.trim()
  return { fixture, el, close, search, type, box, toggle, rowLabels, button, count, stable }
}

describe('IvSelectPickerDialog', () => {
  it('title, description, headers and search come from the data', async () => {
    const { el, search } = await render()
    expect(el.querySelector('iv-dialog-title')!.textContent).toContain('Select groups')
    expect(el.querySelector('iv-dialog-description')!.textContent).toContain('Pick some groups')
    expect(search.placeholder).toBe('Search groups')
    expect(search.getAttribute('aria-label')).toBe('Search groups')
    const headers = Array.from(el.querySelectorAll('th')).map((th) => th.textContent!.trim())
    expect(headers).toEqual(['', 'Group name', 'Details'])
  })

  it('drops rows without a value and seeds the selection', async () => {
    const { rowLabels, box, count } = await render()
    expect(rowLabels()).toEqual(['Engineering', 'Sales', 'Support engineers'])
    expect(box('Sales').getAttribute('aria-checked')).toBe('true')
    expect(box('Engineering').getAttribute('aria-checked')).toBe('false')
    expect(count()).toBe('1 selected')
  })

  it('falls back to defaults when the data is empty; the empty row spans both columns', async () => {
    const { el, search, rowLabels } = await render({})
    expect(el.querySelector('iv-dialog-title')!.textContent).toContain('Select items')
    expect(el.querySelector('iv-dialog-description')).toBeNull()
    expect(search.placeholder).toBe('Search')
    expect(Array.from(el.querySelectorAll('th')).map((th) => th.textContent!.trim())).toEqual(['', 'Name'])
    expect(rowLabels()).toEqual([])
    const empty = el.querySelector('tbody td')!
    expect(empty.textContent!.trim()).toBe('No data found')
    expect(empty.getAttribute('colspan')).toBe('2')
  })

  describe('search', () => {
    it('matches the label, case-insensitively', async () => {
      const { type, rowLabels } = await render()
      await type('ENGINEER')
      expect(rowLabels()).toEqual(['Engineering', 'Support engineers'])
    })

    it('also matches the description', async () => {
      const { type, rowLabels } = await render()
      await type('builders')
      expect(rowLabels()).toEqual(['Engineering'])
    })

    it('clearing restores the full list', async () => {
      const { type, rowLabels } = await render()
      await type('sales')
      await type('  ')
      expect(rowLabels()).toEqual(['Engineering', 'Sales', 'Support engineers'])
    })

    it('no match: the empty message spans every column', async () => {
      const { el, type } = await render()
      await type('zzz')
      const empty = el.querySelector('tbody td')!
      expect(empty.textContent!.trim()).toBe('No groups found.')
      expect(empty.getAttribute('colspan')).toBe('3')
    })
  })

  it('hides the description column when no row has one', async () => {
    const { el } = await render({ ...baseData(), rows: [{ value: 'a', label: 'A' }] })
    expect(el.querySelectorAll('th').length).toBe(2)
    expect(el.querySelectorAll('tbody tr:first-child td').length).toBe(2)
  })

  it('a row toggles and the count is announced', async () => {
    const { toggle, box, count } = await render()
    await toggle('Engineering')
    expect(box('Engineering').getAttribute('aria-checked')).toBe('true')
    expect(box('Engineering').closest('tr')!.dataset['state']).toBe('selected')
    expect(count()).toBe('2 selected')
    await toggle('Sales')
    expect(count()).toBe('1 selected')
  })

  describe('select all', () => {
    it('is mixed with some, checked with all, unchecked with none', async () => {
      const { box, toggle } = await render()
      expect(box('Select all').getAttribute('aria-checked')).toBe('mixed')
      await toggle('Engineering')
      await toggle('Support engineers')
      expect(box('Select all').getAttribute('aria-checked')).toBe('true')
      await toggle('Select all')
      expect(box('Select all').getAttribute('aria-checked')).toBe('false')
      expect(box('Sales').getAttribute('aria-checked')).toBe('false')
    })

    it('selects only the filtered rows and keeps hidden selections', async () => {
      const { type, toggle, count, button, close } = await render()
      await type('engineer')
      await toggle('Select all')
      expect(count()).toBe('3 selected')
      await type('')
      button('Save').click()
      expect(close).toHaveBeenCalledWith(['g1', 'g2', 'g3'])
    })

    it('deselects only the filtered rows', async () => {
      const { type, toggle, count, button, close } = await render({ ...baseData(), selectedValues: ['g1', 'g2', 'g3'] })
      await type('engineer')
      await toggle('Select all')
      expect(count()).toBe('1 selected')
      button('Save').click()
      expect(close).toHaveBeenCalledWith(['g2'])
    })

    it('is disabled with no rows to select', async () => {
      const { type, box } = await render()
      await type('zzz')
      expect(box('Select all').disabled).toBe(true)
      expect(box('Select all').getAttribute('aria-checked')).toBe('false')
    })
  })

  describe('save and cancel', () => {
    it('Save returns values in source order, not click order, ignoring the filter', async () => {
      const { toggle, type, button, close } = await render({ ...baseData(), selectedValues: [] })
      await toggle('Support engineers')
      await toggle('Engineering')
      await type('support')
      button('Save').click()
      expect(close).toHaveBeenCalledWith(['g1', 'g3'])
    })

    it('Save is allowed empty with minSelection 0', async () => {
      const { toggle, button, close } = await render()
      await toggle('Sales')
      expect(button('Save').disabled).toBe(false)
      button('Save').click()
      expect(close).toHaveBeenCalledWith([])
    })

    it('Save stays disabled below minSelection', async () => {
      const { toggle, button } = await render({ ...baseData(), minSelection: 2 })
      expect(button('Save').disabled).toBe(true)
      await toggle('Engineering')
      expect(button('Save').disabled).toBe(false)
    })

    it('a stale value (no row) is kept on Save: it cannot be unticked', async () => {
      const { button, close, count, toggle } = await render({ ...baseData(), selectedValues: ['ghost', 'g3'] })
      expect(count()).toBe('2 selected')
      await toggle('Engineering')
      button('Save').click()
      expect(close).toHaveBeenCalledWith(['g1', 'g3', 'ghost'])
    })

    it('Cancel closes with no result', async () => {
      const { button, close } = await render()
      button('Cancel').click()
      expect(close).toHaveBeenCalledWith()
    })
  })

  it('axe passes', async () => {
    const { fixture } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

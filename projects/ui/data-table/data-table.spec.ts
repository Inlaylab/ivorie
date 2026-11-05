import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table'
import {
  IvColumnDef,
  IvDataTableBody,
  IvDataTableRow,
  IvDataTableRowSelect,
  IvDataTableSelectAll,
  IvDataTableSort,
  IV_DATA_TABLE_IMPORTS,
  ivDataTable,
  ivPagination,
  ivSort,
} from '@inlaylab/ivorie/data-table'

interface Payment {
  id: string
  email: string
  amount: number
  status: string
}

const PAYMENTS: Payment[] = Array.from({ length: 25 }, (_, i) => ({
  id: `p${i}`,
  email: `user${String(i).padStart(2, '0')}@example.com`,
  amount: (i * 37) % 100,
  status: i % 3 ? 'paid' : 'pending',
}))

const COLUMNS: IvColumnDef<Payment>[] = [
  { id: 'email', header: 'Email', accessor: (p) => p.email, sortable: true },
  { id: 'amount', header: 'Amount', accessor: (p) => p.amount, sortable: true },
  { id: 'status', header: 'Status', accessor: (p) => p.status, hideable: true },
]

@Component({
  imports: [IV_TABLE_IMPORTS, IvDataTableSort, IvDataTableRow, IvDataTableSelectAll, IvDataTableRowSelect, IvDataTableBody],
  template: `
    <iv-table>
      <thead ivTableHeader>
        <tr ivTableRow>
          <th ivTableHead><iv-data-table-select-all [selection]="table.selection" /></th>
          <th ivDataTableSort="email" [sort]="table.sort">Email</th>
          <th ivDataTableSort="amount" [sort]="table.sort">Amount</th>
          @if (table.visibility.isVisible('status')) {
            <th ivTableHead>Status</th>
          }
        </tr>
      </thead>
      <tbody ivDataTableBody [rows]="table.rows()" [colspan]="table.visibility.columns().length + 1" [loading]="loading()">
        @for (p of table.rows(); track p.id) {
          <tr ivTableRow [ivDataTableRow]="p.id" [selection]="table.selection">
            <td ivTableCell><iv-data-table-row-select [selection]="table.selection" [rowId]="p.id" /></td>
            <td ivTableCell>{{ p.email }}</td>
            <td ivTableCell>{{ p.amount }}</td>
            @if (table.visibility.isVisible('status')) {
              <td ivTableCell>{{ p.status }}</td>
            }
          </tr>
        }
      </tbody>
    </iv-table>
  `,
})
class Host {
  readonly data = signal(PAYMENTS)
  readonly loading = signal(false)
  readonly table = ivDataTable({ data: this.data, columns: COLUMNS, getRowId: (p) => p.id })
}

@Component({
  imports: [IV_TABLE_IMPORTS, IvDataTableSort],
  template: `
    <iv-table>
      <thead ivTableHeader>
        <tr ivTableRow><th ivDataTableSort="email" [sort]="sort">Email</th></tr>
      </thead>
      <tbody ivTableBody>
        @for (p of sort.rows(); track p.id) {
          <tr ivTableRow><td ivTableCell>{{ p.email }}</td></tr>
        }
      </tbody>
    </iv-table>
  `,
})
class SortOnly {
  readonly sort = ivSort(signal(PAYMENTS.slice(0, 3).reverse()), { columns: COLUMNS })
}

@Component({
  imports: [IV_TABLE_IMPORTS, IvDataTableBody],
  template: `
    <iv-table>
      <tbody ivDataTableBody [rows]="[]" [colspan]="2"><p ivDataTableEmpty>Nothing here</p></tbody>
    </iv-table>
  `,
})
class CustomEmpty {}

async function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const settle = async () => {
    await fixture.whenStable()
  }
  return { fixture, el, host: fixture.componentInstance, settle }
}

const header = (el: HTMLElement, id: string) => el.querySelector<HTMLElement>(`th[ivDataTableSort="${id}"]`)!
const firstEmail = (el: HTMLElement) => el.querySelector('tbody tr td:nth-child(2)')!.textContent!.trim()

describe('IvDataTableSort', () => {
  it('the sort header cycles aria-sort', async () => {
    const { el, settle } = await render(Host)
    const th = header(el, 'email')
    expect(th.getAttribute('aria-sort')).toBe('none')
    expect(th.getAttribute('data-slot')).toBe('data-table-sort')
    th.querySelector('button')!.click()
    await settle()
    expect(th.getAttribute('aria-sort')).toBe('ascending')
    expect(firstEmail(el)).toBe('user00@example.com')
    th.querySelector('button')!.click()
    await settle()
    expect(th.getAttribute('aria-sort')).toBe('descending')
    expect(firstEmail(el)).toBe('user24@example.com')
    th.querySelector('button')!.click()
    await settle()
    expect(th.getAttribute('aria-sort')).toBe('none')
  })

  it('a sort header works with ivSort alone', async () => {
    const { el, settle } = await render(SortOnly)
    expect(el.querySelector('tbody td')!.textContent!.trim()).toBe('user02@example.com')
    header(el, 'email').querySelector('button')!.click()
    await settle()
    expect(el.querySelector('tbody td')!.textContent!.trim()).toBe('user00@example.com')
  })
})

describe('selection parts', () => {
  it('a selected row has data-state selected', async () => {
    const { el, settle } = await render(Host)
    const row = el.querySelector('tbody tr')!
    expect(row.getAttribute('data-state')).toBeNull()
    row.querySelector<HTMLElement>('iv-data-table-row-select button')!.click()
    await settle()
    expect(row.getAttribute('data-state')).toBe('selected')
  })

  it('select all checks the page and goes indeterminate', async () => {
    const { el, host, settle } = await render(Host)
    const all = el.querySelector<HTMLElement>('iv-data-table-select-all button')!
    expect(all.getAttribute('aria-label')).toBe('Select all rows on this page')
    all.click()
    await settle()
    expect(host.table.selection.selected().size).toBe(10)
    el.querySelector<HTMLElement>('tbody iv-data-table-row-select button')!.click()
    await settle()
    expect(all.getAttribute('data-state')).toBe('indeterminate')
  })
})

describe('select all on an empty page', () => {
  it('select all is disabled with no rows and stays unchecked', async () => {
    const { el, host, settle } = await render(Host)
    host.table.filter.setFilter('nobody')
    await settle()
    const all = el.querySelector<HTMLButtonElement>('iv-data-table-select-all button')!
    expect(all.disabled).toBe(true)
    all.click()
    await settle()
    host.table.filter.setFilter('')
    await settle()
    expect(all.getAttribute('data-state')).toBe('unchecked')
  })
})

describe('IvDataTableBody', () => {
  it('loading renders skeleton rows with aria-busy', async () => {
    const { el, host, settle } = await render(Host)
    host.loading.set(true)
    await settle()
    const body = el.querySelector('tbody')!
    expect(body.getAttribute('aria-busy')).toBe('true')
    expect(body.querySelectorAll('tr').length).toBe(10)
    expect(body.querySelectorAll('iv-skeleton').length).toBe(10 * 4)
  })

  it('empty and loading rows span the visible columns', async () => {
    const { el, host, settle } = await render(Host)
    host.table.visibility.setVisible('status', false)
    host.table.filter.setFilter('nobody')
    await settle()
    const cell = el.querySelector('tbody td')!
    expect(cell.getAttribute('colspan')).toBe('3')
    expect(cell.textContent!.trim()).toBe('No results.')
    host.loading.set(true)
    await settle()
    expect(el.querySelector('tbody tr')!.querySelectorAll('td').length).toBe(3)
  })

  it('custom empty content replaces the default', async () => {
    const { el } = await render(CustomEmpty)
    expect(el.querySelector('tbody td')!.textContent!.trim()).toBe('Nothing here')
  })
})

@Component({
  imports: [IV_DATA_TABLE_IMPORTS],
  template: `
    <div class="flex gap-2">
      <label for="dt-filter">Filter emails</label>
      <input id="dt-filter" (input)="table.filter.setFilter($any($event.target).value)" />
      <iv-data-table-view-options [visibility]="table.visibility" />
    </div>
    <iv-table>
      <thead ivTableHeader>
        <tr ivTableRow>
          <th ivTableHead><iv-data-table-select-all [selection]="table.selection" /></th>
          <th ivDataTableSort="email" [sort]="table.sort">Email</th>
          <th ivDataTableSort="amount" [sort]="table.sort">Amount</th>
          @if (table.visibility.isVisible('status')) {
            <th ivTableHead>Status</th>
          }
        </tr>
      </thead>
      <tbody ivDataTableBody [rows]="table.rows()" [colspan]="table.visibility.columns().length + 1">
        @for (p of table.rows(); track p.id) {
          <tr ivTableRow [ivDataTableRow]="p.id" [selection]="table.selection">
            <td ivTableCell><iv-data-table-row-select [selection]="table.selection" [rowId]="p.id" /></td>
            <td ivTableCell>{{ p.email }}</td>
            <td ivTableCell>{{ p.amount }}</td>
            @if (table.visibility.isVisible('status')) {
              <td ivTableCell>{{ p.status }}</td>
            }
          </tr>
        }
      </tbody>
    </iv-table>
    <iv-data-table-pagination [pagination]="table.pagination" [selection]="withSelection() ? table.selection : null" />
  `,
})
class Full {
  readonly withSelection = signal(false)
  readonly table = ivDataTable({ data: signal(PAYMENTS), columns: COLUMNS, getRowId: (p) => p.id })
}

@Component({
  imports: [IV_DATA_TABLE_IMPORTS],
  template: `
    <ul>
      @for (n of pages.rows(); track n) {
        <li>{{ n }}</li>
      }
    </ul>
    <iv-data-table-pagination [pagination]="pages" />
  `,
})
class PagesOnly {
  readonly pages = ivPagination(signal(Array.from({ length: 12 }, (_, i) => i)), { pageSize: 5 })
}

const button = (el: HTMLElement, label: string) => el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!
const pageText = (el: HTMLElement) => el.querySelector('[data-slot="data-table-page"]')!.textContent!.trim()

describe('IvDataTablePagination', () => {
  it('pagination moves between pages and disables at the edges', async () => {
    const { el, settle } = await render(Full)
    expect(el.querySelector('[data-slot="data-table-pagination"]')).not.toBeNull()
    expect(pageText(el)).toBe('Page 1 of 3')
    expect(button(el, 'Go to first page').disabled).toBe(true)
    expect(button(el, 'Go to previous page').disabled).toBe(true)
    button(el, 'Go to next page').click()
    await settle()
    expect(pageText(el)).toBe('Page 2 of 3')
    button(el, 'Go to last page').click()
    await settle()
    expect(pageText(el)).toBe('Page 3 of 3')
    expect(button(el, 'Go to next page').disabled).toBe(true)
    expect(button(el, 'Go to last page').disabled).toBe(true)
    button(el, 'Go to first page').click()
    await settle()
    expect(pageText(el)).toBe('Page 1 of 3')
  })

  it('pagination works with ivPagination alone', async () => {
    const { el, settle } = await render(PagesOnly)
    expect(el.querySelectorAll('li').length).toBe(5)
    button(el, 'Go to last page').click()
    await settle()
    expect(el.querySelectorAll('li').length).toBe(2)
    expect(pageText(el)).toBe('Page 3 of 3')
  })

  it('the page size select changes the page size', async () => {
    const { el, settle } = await render(Full)
    el.querySelector<HTMLElement>('[data-slot="data-table-pagination"] [data-slot="select-trigger"]')!.click()
    await settle()
    ;[...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === '20')!.click()
    await settle()
    expect(el.querySelectorAll('tbody tr').length).toBe(20)
    expect(pageText(el)).toBe('Page 1 of 2')
  })

  it('selection text shows only with a selection', async () => {
    const { el, host, settle } = await render(Full)
    const text = () => el.querySelector('[data-slot="data-table-pagination"]')!.textContent!
    expect(text()).not.toContain('row(s) selected')
    host.withSelection.set(true)
    host.table.selection.toggle('p0')
    host.table.selection.toggle('p1')
    await settle()
    expect(text()).toContain('2 row(s) selected.')
  })

  it('the selected count never reads more than the rows shown', async () => {
    const { el, host, settle } = await render(Full)
    host.withSelection.set(true)
    host.table.selection.toggle('p0')
    host.table.selection.toggle('p1')
    host.table.filter.setFilter('user24')
    await settle()
    const text = el.querySelector('[data-slot="data-table-pagination"]')!.textContent!
    expect(text).toContain('2 row(s) selected.')
    expect(text).not.toMatch(/2 of 1 row/)
  })

  it('zero rows gives page 1 of 1 with every button disabled', async () => {
    const { el, host, settle } = await render(Full)
    host.table.filter.setFilter('nobody')
    await settle()
    expect(pageText(el)).toBe('Page 1 of 1')
    for (const label of ['Go to first page', 'Go to previous page', 'Go to next page', 'Go to last page']) {
      expect(button(el, label).disabled, label).toBe(true)
    }
  })
})

describe('IvDataTableViewOptions', () => {
  it('view options hide a column', async () => {
    const { el, settle } = await render(Full)
    el.querySelector<HTMLElement>('iv-data-table-view-options button')!.click()
    await settle()
    expect(document.body.textContent).toContain('Toggle columns')
    const item = [...document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]')].find(
      (i) => i.textContent!.trim() === 'Status',
    )!
    expect(item.getAttribute('aria-checked')).toBe('true')
    item.click()
    await settle()
    expect([...el.querySelectorAll('thead th')].map((t) => t.textContent!.trim())).not.toContain('Status')
    expect(document.querySelector('[role="menuitemcheckbox"]')).not.toBeNull()
  })
})

describe('the full table', () => {
  it('has no axe violations', async () => {
    const { el, host, settle } = await render(Full)
    host.withSelection.set(true)
    await settle()
    await expect(el).toHaveNoViolations()
  })
})

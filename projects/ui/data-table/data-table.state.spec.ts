import { computed, signal } from '@angular/core'
import { describe, expect, it, vi } from 'vitest'
import {
  IvColumnDef,
  ivColumnVisibility,
  ivDataTable,
  ivFilter,
  ivPagination,
  ivRowSelection,
  ivSort,
} from '@inlaylab/ivorie/data-table'

interface Row {
  id: string
  name: string
  status: string
  value?: unknown
}

const columns: IvColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true },
  { id: 'status', header: 'Status', accessor: (r) => r.status, hideable: true },
  { id: 'value', header: 'Value', accessor: (r) => r.value, sortable: true },
  { id: 'email', header: 'Email', hideable: true },
]

const make = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `r${i}`, name: `n${i}`, status: i % 2 ? 'paid' : 'open' }))

describe('ivSort', () => {
  it('toggleSort cycles asc, desc, none', () => {
    const s = ivSort(signal(make(3)), { columns })
    s.toggleSort('name')
    expect(s.sorting()).toEqual({ id: 'name', desc: false })
    expect(s.direction('name')).toBe('asc')
    s.toggleSort('name')
    expect(s.sorting()).toEqual({ id: 'name', desc: true })
    expect(s.direction('name')).toBe('desc')
    s.toggleSort('name')
    expect(s.sorting()).toBeNull()
    expect(s.direction('name')).toBeNull()
    s.toggleSort('name')
    s.toggleSort('value')
    expect(s.sorting()).toEqual({ id: 'value', desc: false })
  })

  it('strings sort with the collator', () => {
    const rows = ['b10', 'B2', 'a'].map((name, i) => ({ id: `${i}`, name, status: '' }))
    const s = ivSort(signal(rows), { columns, initial: { id: 'name', desc: false } })
    expect(s.rows().map((r) => r.name)).toEqual(['a', 'B2', 'b10'])
  })

  it('sort is stable', () => {
    const rows = [
      { id: 'a', name: 'x', status: '' },
      { id: 'b', name: 'y', status: '' },
      { id: 'c', name: 'x', status: '' },
      { id: 'd', name: 'y', status: '' },
    ]
    const s = ivSort(signal(rows), { columns, initial: { id: 'name', desc: false } })
    expect(s.rows().map((r) => r.id)).toEqual(['a', 'c', 'b', 'd'])
    s.sorting.set({ id: 'name', desc: true })
    expect(s.rows().map((r) => r.id)).toEqual(['b', 'd', 'a', 'c'])
  })

  it('empty values sort last both ways', () => {
    const rows = [3, null, 1, undefined, ''].map((value, i) => ({ id: `${i}`, name: '', status: '', value }))
    const isEmpty = (r: Row) => r.value == null || r.value === ''
    const s = ivSort(signal(rows), { columns, initial: { id: 'value', desc: false } })
    expect(s.rows().map((r) => r.value).slice(0, 2)).toEqual([1, 3])
    expect(s.rows().slice(2).every(isEmpty)).toBe(true)
    s.toggleSort('value')
    expect(s.rows().map((r) => r.value).slice(0, 2)).toEqual([3, 1])
    expect(s.rows().slice(2).every(isEmpty)).toBe(true)
  })
})

describe('ivFilter', () => {
  it('filter matches any column and a column filter', () => {
    const rows = [
      { id: '1', name: 'Ada', status: 'paid' },
      { id: '2', name: 'Adam', status: 'open' },
      { id: '3', name: 'Grace', status: 'paid' },
    ]
    const f = ivFilter(signal(rows), { columns })
    f.setFilter('  ADA ')
    expect(f.rows().map((r) => r.id)).toEqual(['1', '2'])
    f.setColumnFilter('status', 'paid')
    expect(f.rows().map((r) => r.id)).toEqual(['1'])
    f.setColumnFilter('status', '')
    expect(f.columnFilters()).toEqual({})
    expect(f.rows().map((r) => r.id)).toEqual(['1', '2'])
  })
})

describe('ivPagination', () => {
  it('paging edges', () => {
    const p = ivPagination(signal(make(25)))
    expect(p.pageCount()).toBe(3)
    expect(p.rows().length).toBe(10)
    expect(p.canPrevious()).toBe(false)
    p.setPage(99)
    expect(p.page()).toBe(2)
    expect(p.rows().length).toBe(5)
    expect(p.canNext()).toBe(false)
    p.setPage(-1)
    expect(p.page()).toBe(0)
  })

  it('page clamps when data shrinks', () => {
    const data = signal(make(25))
    const p = ivPagination(data)
    p.setPage(2)
    data.set(make(12))
    expect(p.page()).toBe(1)
    expect(p.rows().length).toBe(2)
  })

  it('zero rows is one empty page', () => {
    const p = ivPagination(signal<Row[]>([]))
    expect(p.pageCount()).toBe(1)
    expect(p.page()).toBe(0)
    expect(p.canPrevious()).toBe(false)
    expect(p.canNext()).toBe(false)
  })

  it('setPageSize goes back to the first page', () => {
    const p = ivPagination(signal(make(25)))
    p.setPage(2)
    p.setPageSize(20)
    expect(p.pagination()).toEqual({ pageIndex: 0, pageSize: 20 })
    expect(p.pageCount()).toBe(2)
  })

  it('resetOn resets the page', () => {
    const f = ivFilter(signal(make(25)), { columns })
    const p = ivPagination(f.rows, { pageSize: 5, resetOn: () => [f.globalFilter(), f.columnFilters()] })
    p.setPage(2)
    f.globalFilter.set('n')
    expect(p.pagination()).toEqual({ pageIndex: 0, pageSize: 5 })
    p.setPage(1)
    f.setColumnFilter('status', 'paid')
    expect(p.pagination().pageIndex).toBe(0)
  })
})

describe('manual (server) mode', () => {
  it('manual features pass rows through', () => {
    const data = signal(make(10))
    const sortFn = vi.fn(() => 0)
    const f = ivFilter(data, { columns, manual: true, initial: { globalFilter: 'zzz' } })
    const s = ivSort(f.rows, {
      columns: [{ id: 'name', header: 'Name', sortFn }],
      manual: true,
      initial: { id: 'name', desc: false },
    })
    const p = ivPagination(s.rows, { manual: true, rowCount: signal(95) })
    expect(f.rows()).toBe(data())
    expect(s.rows()).toBe(data())
    expect(p.rows()).toBe(data())
    expect(p.pageCount()).toBe(10)
    expect(p.rowCount()).toBe(95)
    expect(sortFn).not.toHaveBeenCalled()
  })
})

describe('ivRowSelection', () => {
  it('hasRows follows the given rows', () => {
    const rows = signal(make(2))
    const sel = ivRowSelection(rows, { getRowId: (r) => r.id })
    expect(sel.hasRows()).toBe(true)
    rows.set([])
    expect(sel.hasRows()).toBe(false)
  })

  it('selection all and some', () => {
    const sel = ivRowSelection(signal(make(3)), { getRowId: (r) => r.id })
    expect(sel.allSelected()).toBe(false)
    sel.toggleAll()
    expect(sel.allSelected()).toBe(true)
    expect(sel.someSelected()).toBe(false)
    sel.toggle('r0')
    expect(sel.isSelected('r0')).toBe(false)
    expect(sel.someSelected()).toBe(true)
    expect(sel.allSelected()).toBe(false)
    sel.clear()
    expect(sel.selected().size).toBe(0)
  })

  it('no rows is never all selected', () => {
    const sel = ivRowSelection(signal<Row[]>([]), { getRowId: (r) => r.id })
    expect(sel.allSelected()).toBe(false)
  })

  it('toggleAll only touches the given rows', () => {
    const sel = ivRowSelection(signal(make(3)), { getRowId: (r) => r.id })
    sel.toggle('elsewhere')
    sel.toggleAll()
    sel.toggleAll()
    expect([...sel.selected()]).toEqual(['elsewhere'])
  })
})

describe('ivColumnVisibility', () => {
  it('visibility hides a column', () => {
    const v = ivColumnVisibility(columns)
    expect(v.hideable.map((c) => c.id)).toEqual(['status', 'email'])
    v.setVisible('email', false)
    expect(v.isVisible('email')).toBe(false)
    expect(v.columns().map((c) => c.id)).toEqual(['name', 'status', 'value'])
  })
})

describe('ivDataTable', () => {
  it('the bundle filters, sorts and pages', () => {
    const t = ivDataTable({ data: signal(make(25)), columns, getRowId: (r) => r.id, pageSize: 5 })
    expect(t.rows().length).toBe(5)
    t.filter.setColumnFilter('status', 'paid')
    t.sort.toggleSort('name')
    t.sort.toggleSort('name')
    expect(t.pagination.rowCount()).toBe(12)
    expect(t.rows()[0].name).toBe('n23')
    t.pagination.setPage(2)
    expect(t.pagination.page()).toBe(2)
    t.filter.setFilter('n1')
    expect(t.pagination.page()).toBe(0)
    t.selection.toggleAll()
    expect(t.selection.selected().size).toBe(t.rows().length)
    t.visibility.setVisible('status', false)
    expect(t.visibility.columns().map((c) => c.id)).not.toContain('status')
  })

  it('server mode skips the pipeline and fills query()', () => {
    const data = signal(make(10))
    const t = ivDataTable({ data, columns, getRowId: (r) => r.id, mode: 'server', rowCount: signal(95) })
    expect(t.rows()).toBe(data())
    expect(t.pagination.pageCount()).toBe(10)
    t.sort.toggleSort('name')
    t.pagination.setPage(3)
    expect(t.query()).toEqual({
      sorting: { id: 'name', desc: false },
      pagination: { pageIndex: 3, pageSize: 10 },
      globalFilter: '',
      columnFilters: {},
    })
    t.filter.setFilter('ada')
    expect(t.query().pagination.pageIndex).toBe(0)
    expect(t.query().globalFilter).toBe('ada')
  })

  it('query() reads no server output, so a resource can feed rowCount from it', () => {
    let t!: ReturnType<typeof ivDataTable<Row>>
    // Like resource({ params: () => t.query() }): the total depends on the query.
    const rowCount = computed(() => (t.query().pagination.pageIndex >= 0 ? 95 : 0))
    t = ivDataTable({ data: signal(make(10)), columns, getRowId: (r) => r.id, mode: 'server', rowCount })
    t.pagination.setPage(3)
    expect(() => t.query()).not.toThrow()
    expect(t.query().pagination.pageIndex).toBe(3)
    expect(t.pagination.pageCount()).toBe(10)
  })
})

describe('chaining', () => {
  it('a page change does not re-sort', () => {
    const sortFn = vi.fn((a: Row, b: Row) => a.name.localeCompare(b.name))
    const s = ivSort(signal(make(25)), {
      columns: [{ id: 'name', header: 'Name', sortFn }],
      initial: { id: 'name', desc: false },
    })
    const p = ivPagination(s.rows)
    p.rows()
    const calls = sortFn.mock.calls.length
    expect(calls).toBeGreaterThan(0)
    p.setPage(1)
    p.rows()
    expect(sortFn.mock.calls.length).toBe(calls)
  })
})

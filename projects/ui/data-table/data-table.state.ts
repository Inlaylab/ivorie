import { Signal, WritableSignal, computed, linkedSignal, signal } from '@angular/core'

// Five standalone features. Each takes rows and returns its state plus `rows` for the next step,
// so they chain in any order or stand alone. `manual: true` keeps the state but passes rows through
// unchanged (server mode). Plain functions and signals: no DI, safe on the server.

export interface IvColumnDef<T> {
  id: string
  header: string
  accessor?: (row: T) => unknown
  sortable?: boolean
  sortFn?: (a: T, b: T) => number
  filterFn?: (row: T, value: unknown) => boolean
  hideable?: boolean
}

export type IvSorting = { id: string; desc: boolean } | null

export interface IvPageState {
  pageIndex: number
  pageSize: number
}

const isEmpty = (v: unknown) => v === null || v === undefined || v === ''
const text = (v: unknown) => (isEmpty(v) ? '' : String(v).toLowerCase())

// ---- Filter -----------------------------------------------------------------------------------

export interface IvFilter<T> {
  readonly globalFilter: WritableSignal<string>
  readonly columnFilters: WritableSignal<Record<string, unknown>>
  readonly rows: Signal<T[]>
  setFilter(value: string): void
  /** `''`, `null` or `undefined` removes the column's filter. */
  setColumnFilter(id: string, value: unknown): void
}

export interface IvFilterOptions<T> {
  columns: IvColumnDef<T>[]
  manual?: boolean
  initial?: { globalFilter?: string; columnFilters?: Record<string, unknown> }
}

export function ivFilter<T>(rows: Signal<T[]>, options: IvFilterOptions<T>): IvFilter<T> {
  const globalFilter = signal(options.initial?.globalFilter ?? '')
  const columnFilters = signal<Record<string, unknown>>(options.initial?.columnFilters ?? {})
  const byId = new Map(options.columns.map((c) => [c.id, c]))
  const searchable = options.columns.filter((c) => c.accessor)

  const filtered = computed(() => {
    const query = globalFilter().trim().toLowerCase()
    const filters = Object.entries(columnFilters())
      .map(([id, value]) => ({ column: byId.get(id), value }))
      .filter((f): f is { column: IvColumnDef<T>; value: unknown } => !!f.column)
    if (!query && !filters.length) return rows()
    return rows().filter(
      (row) =>
        (!query || searchable.some((c) => text(c.accessor!(row)).includes(query))) &&
        filters.every(({ column, value }) =>
          column.filterFn
            ? column.filterFn(row, value)
            : text(column.accessor?.(row)).includes(text(value)),
        ),
    )
  })

  return {
    globalFilter,
    columnFilters,
    rows: options.manual ? rows : filtered,
    setFilter: (value) => globalFilter.set(value),
    setColumnFilter: (id, value) =>
      columnFilters.update((all) => {
        const { [id]: _, ...rest } = all
        return isEmpty(value) ? rest : { ...rest, [id]: value }
      }),
  }
}

// ---- Sort -------------------------------------------------------------------------------------

export interface IvSort<T> {
  readonly sorting: WritableSignal<IvSorting>
  readonly rows: Signal<T[]>
  direction(id: string): 'asc' | 'desc' | null
  /** Ascending, then descending, then none. Another column starts at ascending. */
  toggleSort(id: string): void
}

export interface IvSortOptions<T> {
  columns: IvColumnDef<T>[]
  manual?: boolean
  initial?: IvSorting
}

export function ivSort<T>(rows: Signal<T[]>, options: IvSortOptions<T>): IvSort<T> {
  const sorting = signal<IvSorting>(options.initial ?? null)
  const byId = new Map(options.columns.map((c) => [c.id, c]))
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

  const compareValues = (a: unknown, b: unknown): number => {
    if (typeof a === 'number' && typeof b === 'number') return a - b
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
    return collator.compare(String(a), String(b))
  }

  const sorted = computed(() => {
    const s = sorting()
    const column = s && byId.get(s.id)
    if (!s || !column) return rows()
    const sign = s.desc ? -1 : 1
    const { sortFn, accessor } = column
    // Array.prototype.sort is stable; desc negates the compare instead of reversing, so ties keep data order.
    return [...rows()].sort((x, y) => {
      if (sortFn) return sign * sortFn(x, y)
      const a = accessor?.(x)
      const b = accessor?.(y)
      // Empty values go last in both directions.
      if (isEmpty(a) || isEmpty(b)) return isEmpty(a) === isEmpty(b) ? 0 : isEmpty(a) ? 1 : -1
      return sign * compareValues(a, b)
    })
  })

  return {
    sorting,
    rows: options.manual ? rows : sorted,
    direction: (id) => {
      const s = sorting()
      return s?.id === id ? (s.desc ? 'desc' : 'asc') : null
    },
    toggleSort: (id) =>
      sorting.update((s) => (s?.id !== id ? { id, desc: false } : s.desc ? null : { id, desc: true })),
  }
}

// ---- Pagination -------------------------------------------------------------------------------

export interface IvPagination<T> {
  readonly pagination: WritableSignal<IvPageState>
  /** The current page. In manual mode, the input rows. */
  readonly rows: Signal<T[]>
  readonly rowCount: Signal<number>
  /** At least 1. */
  readonly pageCount: Signal<number>
  /** The 0-based page index, clamped to the pages that exist. */
  readonly page: Signal<number>
  readonly canPrevious: Signal<boolean>
  readonly canNext: Signal<boolean>
  setPage(index: number): void
  /** Also goes back to the first page. */
  setPageSize(size: number): void
}

export interface IvPaginationOptions {
  pageSize?: number
  manual?: boolean
  /** The total row count in manual mode. */
  rowCount?: Signal<number>
  /** Reads signals; when they change, the page goes back to 0 (e.g. the filter state). */
  resetOn?: () => unknown
}

export function ivPagination<T>(rows: Signal<T[]>, options: IvPaginationOptions = {}): IvPagination<T> {
  const first: IvPageState = { pageIndex: 0, pageSize: options.pageSize ?? 10 }
  const resetOn = options.resetOn ?? (() => null)
  const pagination = linkedSignal<unknown, IvPageState>({
    source: resetOn,
    computation: (_, previous) => (previous ? { ...previous.value, pageIndex: 0 } : first),
  })
  const rowCount = computed(() => (options.manual && options.rowCount ? options.rowCount() : rows().length))
  const pageCount = computed(() => Math.max(1, Math.ceil(rowCount() / pagination().pageSize)))
  const page = computed(() => Math.min(Math.max(pagination().pageIndex, 0), pageCount() - 1))
  const paged = computed(() => {
    const { pageSize } = pagination()
    return rows().slice(page() * pageSize, (page() + 1) * pageSize)
  })

  return {
    pagination,
    rows: options.manual ? rows : paged,
    rowCount,
    pageCount,
    page,
    canPrevious: computed(() => page() > 0),
    canNext: computed(() => page() < pageCount() - 1),
    setPage: (index) =>
      pagination.update((p) => ({ ...p, pageIndex: Math.min(Math.max(index, 0), pageCount() - 1) })),
    setPageSize: (pageSize) => pagination.set({ pageIndex: 0, pageSize }),
  }
}

// ---- Row selection ----------------------------------------------------------------------------

export interface IvRowSelection<T> {
  readonly selected: WritableSignal<ReadonlySet<string>>
  /** Every given row is selected. False when there are no rows. */
  readonly allSelected: Signal<boolean>
  /** Some given rows are selected, not all. */
  readonly someSelected: Signal<boolean>
  /** There are rows to select (select all is disabled without). */
  readonly hasRows: Signal<boolean>
  isSelected(id: string): boolean
  toggle(id: string): void
  /** Selects every given row, or unselects them when all are selected. Other ids stay as they are. */
  toggleAll(): void
  clear(): void
}

export function ivRowSelection<T>(rows: Signal<T[]>, options: { getRowId: (row: T) => string }): IvRowSelection<T> {
  const selected = signal<ReadonlySet<string>>(new Set())
  const ids = computed(() => rows().map(options.getRowId))
  const count = computed(() => ids().filter((id) => selected().has(id)).length)
  const allSelected = computed(() => ids().length > 0 && count() === ids().length)

  return {
    selected,
    allSelected,
    someSelected: computed(() => count() > 0 && !allSelected()),
    hasRows: computed(() => ids().length > 0),
    isSelected: (id) => selected().has(id),
    toggle: (id) =>
      selected.update((s) => {
        const next = new Set(s)
        if (!next.delete(id)) next.add(id)
        return next
      }),
    toggleAll: () => {
      const all = allSelected()
      selected.update((s) => {
        const next = new Set(s)
        for (const id of ids()) all ? next.delete(id) : next.add(id)
        return next
      })
    },
    clear: () => selected.set(new Set()),
  }
}

// ---- Column visibility ------------------------------------------------------------------------

export interface IvColumnVisibility<T> {
  readonly visibility: WritableSignal<Record<string, boolean>>
  /** The visible columns, in order. */
  readonly columns: Signal<IvColumnDef<T>[]>
  readonly hideable: IvColumnDef<T>[]
  isVisible(id: string): boolean
  setVisible(id: string, visible: boolean): void
}

export function ivColumnVisibility<T>(
  columns: IvColumnDef<T>[],
  initial: Record<string, boolean> = {},
): IvColumnVisibility<T> {
  const visibility = signal(initial)
  return {
    visibility,
    columns: computed(() => columns.filter((c) => visibility()[c.id] !== false)),
    hideable: columns.filter((c) => c.hideable),
    isVisible: (id) => visibility()[id] !== false,
    setVisible: (id, visible) => visibility.update((v) => ({ ...v, [id]: visible })),
  }
}

// ---- The bundle -------------------------------------------------------------------------------

export interface IvDataTableQuery {
  sorting: IvSorting
  pagination: IvPageState
  globalFilter: string
  columnFilters: Record<string, unknown>
}

export interface IvDataTable<T> {
  readonly filter: IvFilter<T>
  readonly sort: IvSort<T>
  readonly pagination: IvPagination<T>
  /** Select all acts on the current page. */
  readonly selection: IvRowSelection<T>
  readonly visibility: IvColumnVisibility<T>
  /** The current page. */
  readonly rows: Signal<T[]>
  /** Everything a server needs to answer: feed it to `resource()` or `httpResource()`. */
  readonly query: Signal<IvDataTableQuery>
  readonly getRowId: (row: T) => string
}

export interface IvDataTableOptions<T> {
  data: Signal<T[]>
  columns: IvColumnDef<T>[]
  getRowId: (row: T) => string
  /** `server`: every feature is manual; the rows are the page the server sent. */
  mode?: 'client' | 'server'
  /** The total row count in server mode. */
  rowCount?: Signal<number>
  pageSize?: number
}

/** All five features, chained: filter, sort, pagination; selection over the page; column visibility. */
export function ivDataTable<T>(options: IvDataTableOptions<T>): IvDataTable<T> {
  const manual = options.mode === 'server'
  const { columns } = options
  const filter = ivFilter(options.data, { columns, manual })
  const sort = ivSort(filter.rows, { columns, manual })
  const pagination = ivPagination(sort.rows, {
    manual,
    pageSize: options.pageSize,
    rowCount: options.rowCount,
    resetOn: () => [filter.globalFilter(), filter.columnFilters()],
  })
  return {
    filter,
    sort,
    pagination,
    selection: ivRowSelection(pagination.rows, { getRowId: options.getRowId }),
    visibility: ivColumnVisibility(columns),
    rows: pagination.rows,
    query: computed(() => ({
      sorting: sort.sorting(),
      // The raw page, not the clamped one: the clamp reads rowCount, which a server answer to
      // this query sets, so reading it here would be a cycle.
      pagination: pagination.pagination(),
      globalFilter: filter.globalFilter(),
      columnFilters: filter.columnFilters(),
    })),
    getRowId: options.getRowId,
  }
}

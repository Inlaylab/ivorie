---
title: Data Table
description: Sort, filter, page and select rows. Use one feature or all, in the browser or on your server.
section: component
entry: '@inlaylab/ivorie/data-table'
---

Built on `iv-table`, in the spirit of the shadcn/ui data table. The state lives in five standalone features. Each takes rows and returns its state plus `rows` for the next one, like TanStack row models. The parts take only the feature they need, like `MatSort` and `MatPaginator`. You write the cells.

## Usage

```ts
import { IV_DATA_TABLE_IMPORTS, ivDataTable } from '@inlaylab/ivorie/data-table';

readonly table = ivDataTable({ data: this.payments, columns, getRowId: (p) => p.id });
```

```html
<iv-table>
  <thead ivTableHeader>
    <tr ivTableRow>
      <th ivDataTableSort="email" [sort]="table.sort">Email</th>
    </tr>
  </thead>
  <tbody ivDataTableBody [rows]="table.rows()" [colspan]="1">
    @for (p of table.rows(); track p.id) {
      <tr ivTableRow><td ivTableCell>{{ p.email }}</td></tr>
    }
  </tbody>
</iv-table>
<iv-data-table-pagination [pagination]="table.pagination" />
```

### One feature at a time

Chain only what you need. Each function takes a `Signal<T[]>` and returns `rows`.

```ts
const filter = ivFilter(this.data, { columns });
const sort = ivSort(filter.rows, { columns });
const pages = ivPagination(sort.rows, { pageSize: 20, resetOn: () => [filter.globalFilter(), filter.columnFilters()] });
const selection = ivRowSelection(pages.rows, { getRowId: (r) => r.id });
```

They are plain functions with no injection, so call them anywhere: in a field, a service or a test.

## Examples

### Sorting

<!-- demo: data-table-sorting -->

### Row selection

<!-- demo: data-table-row-selection -->

### Server mode

<!-- demo: data-table-server -->

### Loading and empty

<!-- demo: data-table-states -->

## Server mode

With `mode: 'server'` (or `manual: true` on a single feature), the features keep their state but pass the rows through unchanged. Send `table.query()` to your API and give back one page:

```ts
readonly table = ivDataTable({ mode: 'server', data: this.page, rowCount: this.total, columns, getRowId });
readonly orders = httpResource(() => ({ url: '/api/orders', params: toParams(this.table.query()) }));
```

`query()` holds `sorting`, `pagination`, `globalFilter` and `columnFilters`. A filter change sets the page back to the first one, in both modes.

While the next page loads, a resource has no value. Keep the last page and total (the server example uses a `linkedSignal`), so the page count and the buttons do not jump. `query()` never reads `rowCount`, so the total can come from the same resource.

## API

### Columns

`IvColumnDef<T>`: `{ id, header, accessor?, sortable?, sortFn?, filterFn?, hideable? }`. `accessor` gives the value to sort and filter by. Strings sort with `Intl.Collator` (numeric, so `1.10` comes after `1.2`). Numbers and dates sort by value. Empty values go last.

### Features

| Function | Returns |
|---|---|
| `ivFilter(rows, { columns, manual?, initial? })` | `globalFilter`, `columnFilters`, `rows`, `setFilter(value)`, `setColumnFilter(id, value)` |
| `ivSort(rows, { columns, manual?, initial? })` | `sorting`, `rows`, `direction(id)`, `toggleSort(id)` (ascending, descending, none) |
| `ivPagination(rows, { pageSize?, manual?, rowCount?, resetOn? })` | `pagination`, `rows`, `rowCount`, `pageCount`, `page`, `canPrevious`, `canNext`, `setPage(i)`, `setPageSize(n)` |
| `ivRowSelection(rows, { getRowId })` | `selected`, `allSelected`, `someSelected`, `isSelected(id)`, `toggle(id)`, `toggleAll()`, `clear()` |
| `ivColumnVisibility(columns, initial?)` | `visibility`, `columns` (visible), `hideable`, `isVisible(id)`, `setVisible(id, on)` |
| `ivDataTable({ data, columns, getRowId, mode?, rowCount?, pageSize? })` | `filter`, `sort`, `pagination`, `selection`, `visibility`, `rows`, `query` |

State values are writable signals. `toggleAll()` acts on the rows the selection was given, so with pagination it selects the page. The page index is clamped: when the data shrinks, the last page shows.

### Parts

| Part | Inputs |
|---|---|
| `th[ivDataTableSort]` | `ivDataTableSort` (column id), `sort`. Use it instead of `ivTableHead`. |
| `tr[ivDataTableRow]` | `ivDataTableRow` (row id), `selection`. Sets `data-state="selected"`. |
| `iv-data-table-select-all` | `selection` |
| `iv-data-table-row-select` | `selection`, `rowId`, `aria-label` (default `Select row`) |
| `tbody[ivDataTableBody]` | `rows`, `colspan`, `loading`, `loadingRows` (default `10`). Use it instead of `ivTableBody`. |
| `iv-data-table-pagination` | `pagination`, `selection` (shows the selected count), `pageSizes` (default `[10, 20, 30, 50]`) |
| `iv-data-table-view-options` | `visibility` |

`IV_DATA_TABLE_IMPORTS` holds every part and the table parts.

## Accessibility

- Sort headers set `aria-sort` and sort with a native button, so Enter and Space work.
- "Page X of Y" is a polite live region. The page buttons have labels: "Go to first page", and so on.
- While loading, the body has `aria-busy="true"`.
- Give each row checkbox a label that names the row, for example `[aria-label]="'Select ' + p.email"`.

## Notes

- Put custom empty content in one element with `ivDataTableEmpty`, directly in the body. Do not wrap it in `@if`: the block fills the slot even when false, so the default text never shows.
- There is no cell-renderer API. Cells are your template, so any component works in a cell.

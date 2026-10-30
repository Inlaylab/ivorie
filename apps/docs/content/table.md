---
title: Table
description: Styled parts for native HTML tables.
section: component
entry: '@ivorie/ui/table'
---

Ports the shadcn/ui `Table`. `iv-table` wraps a native `<table>` in a horizontally scrollable container. The other parts are attribute directives on native table elements, so the HTML table semantics stay intact.

## Usage

```ts
import { IV_TABLE_IMPORTS } from '@ivorie/ui/table';
```

```html
<iv-table>
  <thead ivTableHeader>
    <tr ivTableRow>
      <th ivTableHead>Name</th>
      <th ivTableHead>Email</th>
    </tr>
  </thead>
  <tbody ivTableBody>
    @for (user of users; track user.id) {
      <tr ivTableRow>
        <td ivTableCell>{{ user.name }}</td>
        <td ivTableCell>{{ user.email }}</td>
      </tr>
    }
  </tbody>
</iv-table>
```

## Examples

### Footer

<!-- demo: table-footer -->

### Caption

<!-- demo: table-caption -->

### Selected rows

<!-- demo: table-selected-rows -->

### In a card

<!-- demo: table-in-a-card -->

## API

Every part also accepts `class`.

### iv-table

The host is the scroll container. `class` and `layout` style the inner `<table>`.

| Name | Type | Default | Description |
|---|---|---|---|
| `layout` | `'auto' \| 'fixed'` | `'auto'` | `fixed` sets `table-layout: fixed`. |

### Directives

Each directive goes on the matching native element. They have no inputs besides `class`.

| Selector | Element |
|---|---|
| `thead[ivTableHeader]` | `<thead>` |
| `tbody[ivTableBody]` | `<tbody>` |
| `tfoot[ivTableFooter]` | `<tfoot>` |
| `tr[ivTableRow]` | `<tr>` |
| `th[ivTableHead]` | `<th>` |
| `td[ivTableCell]` | `<td>` |
| `caption[ivTableCaption]` | `<caption>` |

## Accessibility

- Parts render native `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td` and `caption` elements, so roles, `colspan`, `rowspan` and `scope` work as in plain HTML.
- Add a `<caption ivTableCaption>` to name the table.
- Selection by `data-state="selected"` is visual only. Also expose it with `aria-selected` or a checkbox.

## Notes

- A row gets a muted background on hover, when `data-state="selected"`, and when it contains an element with `aria-expanded="true"`.
- The last row in `tbody` has no bottom border.
- There is no sorting, pagination or virtualization. Add them around the table.

---
title: Select Picker
description: A multi-select that shows chips on one line and picks in a searchable checkbox dialog.
section: component
entry: '@ivorie/ui/extras/select-picker'
---

Use it for multi-select from a known list. For free-text tag entry, use the combobox with `searchSubmit`.

## Usage

```ts
import { IV_SELECT_PICKER_IMPORTS } from '@ivorie/ui/extras/select-picker';
```

```html
<iv-select-picker
  [items]="groups"
  [valueFn]="groupName"
  [labelFn]="groupName"
  [(ngModel)]="selected"
  placeholder="Select groups"
/>
```

```ts
readonly groupName = (group: Group): string => group.name;
```

`IV_SELECT_PICKER_IMPORTS` holds only the trigger. Never add `IvSelectPickerDialog` to an NgModule `imports`. `IvDialog` creates it at runtime, and listing it fails the AOT build with NG3004.

## Examples

### Form control

<!-- demo: select-picker-form-control -->

### Description column

<!-- demo: select-picker-description-column -->

### Minimum selection

<!-- demo: select-picker-minimum-selection -->

## API

Every part also accepts `class`.

### iv-select-picker

The value is `string[]`. It works with `ngModel` and `formControlName`.

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | `[]` | Full option list. Filtering is client-side. |
| `valueFn` | `(item: T) => string` | `String(item)` | Item identity. This is what gets stored. |
| `labelFn` | `(item: T) => string` | `String(item)` | Display text for chips and the table. |
| `descriptionFn` | `(item: T) => string` | none | Adds a second, searchable table column. |
| `placeholder` | `string` | `'Select…'` | Shown when nothing is selected. |
| `dialogTitle` | `string` | `'Select items'` | Dialog title. |
| `dialogDescription` | `string` | `''` | Optional dialog sub-header. |
| `searchPlaceholder` | `string` | `'Search'` | Placeholder of the search box. |
| `valueColumnHeader` | `string` | `'Name'` | Header of the label column. |
| `descriptionColumnHeader` | `string` | `''` | Header of the description column. Needs `descriptionFn`. |
| `emptyMessage` | `string` | `'No data found'` | Shown when no row matches. |
| `minSelection` | `number` | `0` | Save stays disabled below this count. |
| `disabled` | `boolean` | `false` | Also set by the form through `setDisabledState`. |
| `ariaLabel` | `string` | `''` | Set it when there is no `<label ivLabel>`. |
| `id` | `string \| null` | `null` | Goes on the inner button, so `<label for>` works. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `selectionChange` | `string[]` | Emits the new selection on Save. The form control gets the same value. |

## Accessibility

- The whole control is one `<button>` with `aria-haspopup="dialog"` and `aria-expanded`.
- Set `ariaLabel`, or link a `<label>` with `id`.
- The dialog traps focus. Escape acts as Cancel; a backdrop click does nothing (`disableBackdropClose`), so an accidental click outside doesn't discard the selection.
- The offscreen chip measuring row is `aria-hidden`.

## Notes

- Assign a new `items` array. An in-place push is not seen.
- Chips are measured, not guessed. At least one chip always shows. The rest collapse into `+N more`.
- Cancel discards. The dialog reports back only on Save.
- Save order follows `items` order, not click order.
- Select-all applies to the filtered rows only.
- A stored value with no matching item still shows as a chip with its raw value.
- It opens as a nested dialog when the host is a dialog.

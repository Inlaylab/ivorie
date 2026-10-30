---
title: Combobox
description: A searchable select with single and multi-select modes for Angular forms.
section: component
entry: '@ivorie/ui/combobox'
---

An autocomplete input with a filterable list. It supports single select, multi-select with chips, groups, an empty state, `ngModel` and reactive forms.

## Usage

```ts
import { IV_COMBOBOX_IMPORTS } from '@ivorie/ui/combobox';
```

```html
<iv-combobox [(value)]="fruit">
  <iv-combobox-input aria-label="Fruit" />
  <iv-combobox-content>
    <iv-combobox-list>
      <iv-combobox-item value="apple" label="Apple">Apple</iv-combobox-item>
      <iv-combobox-item value="banana" label="Banana">Banana</iv-combobox-item>
      <iv-combobox-empty>No fruit found.</iv-combobox-empty>
    </iv-combobox-list>
  </iv-combobox-content>
</iv-combobox>
```

Each item needs `label`. Search filters on it, so it must match the visible text.

## Examples

### Multiple with chips

<!-- demo: combobox-multiple -->

### Reactive forms

<!-- demo: combobox-reactive-forms -->

### Groups

<!-- demo: combobox-groups -->

### Without trigger button

<!-- demo: combobox-no-trigger -->

### Filter label

<!-- demo: combobox-filter-label -->

## API

Every part also accepts `class`.

### iv-combobox

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| string[] \| null` | `null` | Selected value. A `string[]` when `multiple`. Bind with `[(value)]`. |
| `placeholder` | `string` | `'Select…'` | Input placeholder. |
| `disabled` | `boolean` | `false` | Disables all interaction. Also disabled when the form control is disabled. |
| `multiple` | `boolean` | `false` | Multi-select mode. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `string \| string[] \| null` | Emits when the user selects or removes a value. |
| `searchChange` | `string` | Emits as the search text changes. Use it for server-side filtering. |
| `searchSubmit` | `string` | Enter with the list open and no active item. Emits the trimmed search, then clears it. Not emitted for an empty search or for the selected item's label. |

### iv-combobox-input

Search input in a group, with optional trigger and clear buttons. `class` goes on the container.

| Name | Type | Default | Description |
|---|---|---|---|
| `showTrigger` | `boolean` | `true` | Shows the chevron button. |
| `showClear` | `boolean` | `false` | Shows a clear button when the search is not empty. |
| `placeholder` | `string \| undefined` | root `placeholder` | Overrides the root placeholder. |
| `listboxId` | `string \| undefined` | generated | Id of the list the input controls. |
| `id` | `string \| null` | `null` | Set on the inner input, so `<label for>` works. |
| `aria-label` | `string \| null` | `null` | Set on the inner input. |
| `label` | `string` | `''` | Static prefix before the input, such as `User: All`. With a value, the input gets `data-active`. |

### iv-combobox-chips

Multi-select container with a built-in text input. Put `iv-combobox-chip` elements inside. `class` goes on the container.

| Name | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| null` | `null` | Set on the inner input, so `<label for>` works. |
| `aria-label` | `string \| null` | `null` | Set on the inner input. |

### iv-combobox-chip

A selected value with a remove button.

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Value removed when the chip is dismissed. |
| `label` | `string` | `''` | Text shown in the chip. |

### iv-combobox-content

The dropdown panel, shown in a CDK overlay anchored to this element.

| Name | Type | Default | Description |
|---|---|---|---|
| `align` | `'start' \| 'end'` | `'start'` | Alignment against the anchor. |
| `side` | `'auto' \| 'bottom'` | `'auto'` | `'auto'` flips above when there is no room below. |

### iv-combobox-list

Scrollable listbox inside the content.

| Name | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| undefined` | generated | Id of the listbox. |

### iv-combobox-item

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Value set on selection. |
| `label` | `string` | `''` | Text used for search and for the input after selection. |
| `disabled` | `boolean` | `false` | Blocks selection. |

### iv-combobox-group, iv-combobox-label, iv-combobox-separator, iv-combobox-empty

Layout parts with no inputs besides `class`. The empty part shows only when no item matches the search.

## Accessibility

- The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`. Focus stays in the input.
- The list has `role="listbox"` and `aria-multiselectable` in multiple mode. Items have `role="option"`, `aria-selected` and `aria-disabled`.
- `ArrowDown` and `ArrowUp` open the list and move the active item (wraps). Disabled and filtered-out items are skipped.
- `Enter` with the list open selects the active item, or submits the search when none is active. With the list closed it does nothing.
- `Escape` closes an open list and is handled, so an enclosing dialog stays open. `Tab` closes it.
- `Backspace` in an empty chips input removes the last chip.
- The trigger button is labelled "Open" or "Close". The clear button is labelled "Clear search". Each chip's remove button is labelled "Remove <label>".

## Notes

- Filtering is client-side. An item shows when its lower-case `label` contains the trimmed lower-case search. An empty search shows every item. An item with an empty `label` is hidden once the search is not empty.
- For server-side filtering, listen to `searchChange` and update the items. Keep each `label` matching what the server returns.
- In single mode the input shows the selected item's label. Closing the list restores it.
- Closing marks the form control touched.
- The panel opens below, or above when there is no room, and is not clipped by parent `overflow`.
- A truncated value in `iv-combobox-input` shows a tooltip on hover when the list is closed.
- `ngModel` and `formControlName` need `FormsModule` or `ReactiveFormsModule`.

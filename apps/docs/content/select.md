---
title: Select
description: A custom dropdown for picking one value, built for Angular forms.
section: component
entry: '@ivorie/ui/select'
---

A styled dropdown, not a native `<select>`. It supports `ngModel`, reactive forms, groups, labels and separators.

## Usage

```ts
import { IV_SELECT_IMPORTS } from '@ivorie/ui/select';
```

```html
<iv-select [(value)]="fruit" placeholder="Pick a fruit">
  <iv-select-trigger />
  <iv-select-content>
    <iv-select-item value="apple">Apple</iv-select-item>
    <iv-select-item value="banana">Banana</iv-select-item>
  </iv-select-content>
</iv-select>
```

## Examples

### With ngModel

<!-- demo: select-ngmodel -->

### Reactive forms

<!-- demo: select-reactive-forms -->

### Groups

<!-- demo: select-groups -->

### Small

<!-- demo: select-small -->

### Disabled

<!-- demo: select-disabled -->

### Disabled item

<!-- demo: select-disabled-item -->

### Filter label

<!-- demo: select-filter-label -->

## API

Every part also accepts `class`.

### iv-select

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` | `null` | Selected value. Bind with `[(value)]`. |
| `placeholder` | `string` | `'Select an option'` | Shown when no item matches the value. |
| `disabled` | `boolean` | `false` | Disables the trigger. Also disabled when the form control is disabled. |
| `size` | `'default' \| 'sm'` | `'default'` | Trigger size. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `string \| null` | Emits when the user selects an item. |

### iv-select-trigger

Renders a native button. `class` goes on that button. The trigger is `w-fit`; add `class="w-full"` to fill its container. A truncated value shows its full text in a tooltip on hover.

| Name | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| null` | `null` | Set on the inner button, so `<label for>` works. |
| `aria-label` | `string \| null` | `null` | Set on the inner button. |
| `aria-labelledby` | `string \| null` | `null` | Set on the inner button. |
| `size` | `'default' \| 'sm' \| undefined` | `undefined` | Overrides the root `size`. |
| `label` | `string` | `''` | Static prefix before the value, such as `Feature: All`. For filter bars. |
| `resetValue` | `string` | `''` | Value that means "no filter". With `label` set, any other value marks the trigger active (`data-active`). |

### iv-select-content

The dropdown panel, shown in a CDK overlay. No inputs besides `class`.

### iv-select-group

Wraps related items. Has `role="group"`. No inputs besides `class`.

### iv-select-label

Muted heading for a group. No inputs besides `class`.

### iv-select-item

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Value set on selection. |
| `disabled` | `boolean` | `false` | Blocks selection of this item. |

### iv-select-separator

A divider line. Hidden from assistive tech. No inputs besides `class`.

## Accessibility

- Focus stays on the trigger. It has `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`.
- The list has `role="listbox"`. Items have `role="option"`, `aria-selected` and `aria-disabled`.
- `Enter`, `Space`, `ArrowDown` and `ArrowUp` open the list on the selected item, else the first.
- While open: arrows, `Home`, `End` and typeahead move the active option and skip disabled items.
- `Enter` or `Space` selects and closes. `Escape` closes and returns focus to the trigger. `Tab` closes.
- `Escape` is handled, so an enclosing dialog stays open.

## Notes

- The trigger shows the text of the item whose `value` matches. Items added later (for example from async data) update it. No match shows the placeholder.
- The list is a CDK overlay, so parent `overflow: hidden` does not clip it. A click outside closes it.
- Closing marks the form control touched.
- `ngModel` and `formControlName` need `FormsModule` or `ReactiveFormsModule`.

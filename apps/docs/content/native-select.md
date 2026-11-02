---
title: Native Select
description: A styled native select element. Works with forms out of the box.
section: component
entry: '@inlaylab/ivorie/native-select'
---

Use it when you want the browser's own picker: on phones, in long forms, or with no JavaScript overlay. For a custom list with search or rich items, use [Select](docs/select) or [Combobox](docs/combobox).

## Usage

```ts
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';
```

```html
<iv-native-select>
  <select ivNativeSelect aria-label="Status">
    <option ivNativeSelectOption value="todo">Todo</option>
    <option ivNativeSelectOption value="done">Done</option>
  </select>
</iv-native-select>
```

## Examples

### Groups

<!-- demo: native-select-groups -->

### Small

<!-- demo: native-select-small -->

### Reactive forms

<!-- demo: native-select-reactive-forms -->

## API

Every part also accepts `class`.

### iv-native-select

The wrapper. It draws the chevron over the select.

| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'default' \| 'sm'` | `'default'` | Height. The select inside gets the same `data-size`. |

### select[ivNativeSelect]

The select itself. Use `formControl`, `formControlName` or `ngModel` as on any select.

### option[ivNativeSelectOption], optgroup[ivNativeSelectOptGroup]

Options and groups in system colors, so the open list stays readable in dark mode.

## Accessibility

A native `select`: keyboard and screen readers work as in the browser. Give it a `label` or `aria-label`.

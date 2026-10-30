---
title: Radio Group
description: A set of radio buttons with arrow-key navigation that works with Angular forms.
section: component
entry: '@inlaylab/ivorie/radio-group'
---

A group of native `<button role="radio">` items. It supports `ngModel`, reactive forms and plain two-way binding.

## Usage

```ts
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';
```

```html
<iv-radio-group [(value)]="plan">
  <iv-radio-group-item value="starter" aria-label="Starter" />
  <iv-radio-group-item value="pro" aria-label="Pro" />
</iv-radio-group>
```

## Examples

### With ngModel

<!-- demo: radio-group-ngmodel -->

### Reactive forms

<!-- demo: radio-group-reactive-forms -->

### With labels

<!-- demo: radio-group-with-labels -->

### Disabled group

<!-- demo: radio-group-disabled-group -->

### Disabled item

<!-- demo: radio-group-disabled-item -->

## API

Every part also accepts `class`.

### iv-radio-group

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` | `null` | Selected value. Bind with `[(value)]`. |
| `disabled` | `boolean` | `false` | Disables all items. Also disabled when the form control is disabled. |
| `orientation` | `'horizontal' \| 'vertical' \| undefined` | `undefined` | Sets `aria-orientation`. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `string \| null` | Emits when the user selects an item. |

### iv-radio-group-item

Must be a descendant of `iv-radio-group`. Renders a native button; `class` goes on that button.

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Value this item stands for. |
| `disabled` | `boolean` | `false` | Disables this item only. |
| `id` | `string \| null` | `null` | Set on the inner button, so `<label for>` works. |
| `aria-label` | `string \| null` | `null` | Set on the inner button. |
| `aria-labelledby` | `string \| null` | `null` | Set on the inner button. |

## Accessibility

- The group has `role="radiogroup"`. Each item is `<button role="radio">` with `aria-checked`.
- Only one item is in the tab order (roving tabindex): the checked item, else the first enabled one.
- Arrow Down and Arrow Right select the next enabled item. Arrow Up and Arrow Left select the previous one. Both wrap at the ends and skip disabled items.
- `Space` selects the focused item. `Enter` does nothing, as in Radix.
- A wrapping `<label>` and `<label for>` both work.

## Notes

- `ngModel` and `formControlName` need `FormsModule` or `ReactiveFormsModule`.
- Each item button has `data-state`, `data-checked`, `data-unchecked` and `data-disabled`.
- Setting the value from the form does not emit `valueChange`.

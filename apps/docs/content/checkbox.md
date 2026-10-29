---
title: Checkbox
description: A checkbox with an indeterminate state that works with Angular forms.
section: component
entry: '@ivorie/ui/checkbox'
---

A native `<button role="checkbox">` that works as a form control. It supports `ngModel`, reactive forms and plain two-way binding.

## Usage

```ts
import { IvCheckbox } from '@ivorie/ui/checkbox';
```

```html
<iv-checkbox [(checked)]="agreed" aria-label="Accept terms" />
```

## Examples

### With ngModel

<!-- demo: checkbox-ngmodel -->

### Reactive forms

<!-- demo: checkbox-reactive-forms -->

### With label

<!-- demo: checkbox-with-label -->

### Indeterminate

<!-- demo: checkbox-indeterminate -->

### Disabled

<!-- demo: checkbox-disabled -->

## API

Every part also accepts `class`.

### iv-checkbox

| Name | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | `false` | Checked state. Bind with `[(checked)]`. |
| `indeterminate` | `boolean` | `false` | Shows a minus icon. A click moves it to checked. |
| `disabled` | `boolean` | `false` | Blocks interaction. Also disabled when the form control is disabled. |
| `id` | `string \| null` | `null` | Set on the inner button, so `<label for>` works. |
| `aria-label` | `string \| null` | `null` | Set on the inner button. |
| `aria-labelledby` | `string \| null` | `null` | Set on the inner button. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `checkedChange` | `boolean` | Emits after the user toggles. |

## Accessibility

- Renders `<button type="button" role="checkbox">`. The host is `display: contents`.
- `aria-checked` is `true`, `false` or `"mixed"` (indeterminate).
- `Space` toggles. `Enter` does nothing, as in Radix. `Tab` moves focus.
- A wrapping `<label>` and `<label for>` both work, because the button is labelable.
- Disabled uses the native `disabled` attribute.
- An invisible padded area makes the hit target larger.

## Notes

- `ngModel` and `formControlName` need `FormsModule` or `ReactiveFormsModule`.
- The button has `data-state` set to `checked`, `unchecked` or `indeterminate`.
- The form marks the control touched on blur. Setting the value from the form does not emit `checkedChange`.
- Indeterminate click cycle: indeterminate, checked, unchecked, checked.

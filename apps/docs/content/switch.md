---
title: Switch
description: A toggle switch that works with Angular forms.
section: component
entry: '@inlaylab/ivorie/switch'
---

A native `<button role="switch">` that works as a form control. It supports `ngModel`, reactive forms and plain two-way binding.

## Usage

```ts
import { IvSwitch } from '@inlaylab/ivorie/switch';
```

```html
<iv-switch [(checked)]="enabled" aria-label="Notifications" />
```

## Examples

### With ngModel

<!-- demo: switch-ngmodel -->

### Reactive forms

<!-- demo: switch-reactive-forms -->

### With label

<!-- demo: switch-with-label -->

### Small

<!-- demo: switch-small -->

### Disabled

<!-- demo: switch-disabled -->

## API

Every part also accepts `class`.

### iv-switch

| Name | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | `false` | On/off state. Bind with `[(checked)]`. |
| `size` | `'default' \| 'sm'` | `'default'` | Track and thumb size. |
| `disabled` | `boolean` | `false` | Blocks interaction. Also disabled when the form control is disabled. |
| `id` | `string \| null` | `null` | Set on the inner button, so `<label for>` works. |
| `aria-label` | `string \| null` | `null` | Set on the inner button. |
| `aria-labelledby` | `string \| null` | `null` | Set on the inner button. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `checkedChange` | `boolean` | Emits after the user toggles. |

## Accessibility

- Renders `<button type="button" role="switch">`. The host is `display: contents`.
- `aria-checked` follows the checked state.
- `Space` and `Enter` toggle. `Tab` moves focus.
- A wrapping `<label>` and `<label for>` both work.
- Disabled uses the native `disabled` attribute.
- An invisible padded area makes the hit target larger.

## Notes

- `ngModel` and `formControlName` need `FormsModule` or `ReactiveFormsModule`.
- The button and thumb have `data-state` (`checked` or `unchecked`) and `data-disabled`.
- The form marks the control touched on blur. Setting the value from the form does not emit `checkedChange`.

---
title: Input
description: Styled input, textarea, label and input group with addons.
section: component
entry: '@ivorie/ui/input'
---

Plain directives on native elements. Template-driven and reactive forms work unchanged.

## Usage

```ts
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';
```

```html
<label ivLabel for="email">Email</label>
<input ivInput id="email" type="email" />
```

## Examples

### Disabled and invalid

<!-- demo: input-states -->

### Textarea

<!-- demo: input-textarea -->

### Input group icon

<!-- demo: input-group-icon -->

### Input group button

<!-- demo: input-group-button -->

### Input group text

<!-- demo: input-group-text -->

### Block addon

<!-- demo: input-group-block -->

### Group textarea

<!-- demo: input-group-textarea -->

## API

Every part also accepts `class`.

### input[ivInput], textarea[ivTextarea], label[ivLabel]

Directives with no inputs besides `class`.

### iv-input-group

No inputs besides `class`. Use `input[ivInputGroupInput]` and `textarea[ivInputGroupTextarea]` as its controls. They drop their own border and ring so the group draws them.

### iv-input-group-addon

| Name | Type | Default | Description |
|---|---|---|---|
| `align` | `'inline-start' \| 'inline-end' \| 'block-start' \| 'block-end'` | `'inline-start'` | Position relative to the control. |

### iv-input-group-text

No inputs besides `class`. Muted helper text in an addon.

### iv-input-group-button

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'outline' \| 'secondary' \| 'ghost' \| 'destructive' \| 'link'` | `'ghost'` | Same variants as `ivButton`. |
| `size` | `'xs' \| 'sm' \| 'icon-xs' \| 'icon-sm'` | `'xs'` | Button size. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native `type`. |
| `disabled` | `boolean` | `false` | Disables the inner button. |
| `aria-label` | `string \| null` | `null` | Accessible name, set on the inner button. |

## Accessibility

- `iv-input-group` and `iv-input-group-addon` have `role="group"`.
- Set `aria-invalid="true"` on a control for the destructive border and ring. The group picks it up too.
- Pair every control with a `label[ivLabel]` and `for`/`id`.
- Clicking an addon focuses the group's `input`, unless the click is on a button.
- Icon-only `iv-input-group-button` needs `aria-label`.

## Notes

- Use `ivInput` and `ivTextarea` for standalone controls. Do not wrap them.
- `aria-invalid` is not set for you. Bind it, for example `[attr.aria-invalid]="control.invalid && control.touched"`.

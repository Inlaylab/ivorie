---
title: Toggle Group
description: A set of toggles where one or many can be on.
section: component
entry: '@inlaylab/ivorie/toggle-group'
---

## Usage

```ts
import { IV_TOGGLE_GROUP_IMPORTS } from '@inlaylab/ivorie/toggle-group';
```

```html
<iv-toggle-group type="single" aria-label="Align" [(value)]="align">
  <button ivToggleGroupItem value="left">Left</button>
  <button ivToggleGroupItem value="right">Right</button>
</iv-toggle-group>
```

## Examples

### Single, joined

<!-- demo: toggle-group-single -->

### Reactive forms

<!-- demo: toggle-group-reactive-forms -->

## API

Every part also accepts `class`.

### iv-toggle-group

Works with `formControl`, `formControlName` and `ngModel`.

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | `'single' \| 'multiple'` | `'single'` | One pressed item, or many. |
| `value` | `string \| string[] \| null` | `null` | `single`: the value or `null`. `multiple`: the list of values. |
| `disabled` | `boolean` | `false` | Disables every item. |
| `variant` | `'default' \| 'outline'` | `'default'` | Look of every item. |
| `size` | `'default' \| 'sm' \| 'lg'` | `'default'` | Size of every item. |
| `spacing` | `number` | `2` | Gap in spacing units. `0` joins the items. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout and arrow keys. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `string \| string[] \| null` | The new value. |

### button[ivToggleGroupItem]

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | The item's value. |
| `disabled` | `boolean` | `false` | Disables this item. |

## Accessibility

- The group has `role="group"`; give it an `aria-label`.
- `single`: items are `role="radio"` with `aria-checked`. `multiple`: items use `aria-pressed`.
- One tab stop. Arrow keys move focus, Home and End jump to the ends. Space and Enter press.

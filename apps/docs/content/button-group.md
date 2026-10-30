---
title: Button Group
description: Fuses buttons, inputs and text addons into one control.
section: component
entry: '@inlaylab/ivorie/button-group'
---

Adjacent borders collapse and inner radii are removed. Works horizontally or vertically.

## Usage

```ts
import { IV_BUTTON_GROUP_IMPORTS } from '@inlaylab/ivorie/button-group';
```

```html
<iv-button-group>
  <button ivButton variant="outline">Bold</button>
  <button ivButton variant="outline">Italic</button>
</iv-button-group>
```

## Examples

### Vertical

<!-- demo: button-group-vertical -->

### Text addon

<!-- demo: button-group-text -->

### Separator

<!-- demo: button-group-separator -->

### Nested

<!-- demo: button-group-nested -->

## API

Every part also accepts `class`.

### iv-button-group

| Name | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction and the axis where borders collapse. |

### iv-button-group-text

No inputs besides `class`. Muted text or icon addon.

### iv-button-group-separator

| Name | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | `vertical` is a thin vertical bar. Use `horizontal` inside a vertical group. |

## Accessibility

`iv-button-group` has `role="group"`. Give it an `aria-label` to name the group. `iv-button-group-separator` has `role="none"` (decorative). Focused children are raised so the focus ring is not clipped.

## Notes

- Children need a border for the fusion to show. Use `variant="outline"` buttons. `ghost` buttons have no border.
- Pair `iv-button-group-text` with outline buttons so borders line up.
- Nested groups get a gap automatically.

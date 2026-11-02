---
title: Slider
description: Pick a number, or a range, by dragging a thumb.
section: component
entry: '@inlaylab/ivorie/slider'
---

## Usage

```ts
import { IvSlider } from '@inlaylab/ivorie/slider';
```

```html
<iv-slider aria-label="Volume" [(value)]="volume" />
```

The value is an array: one number per thumb. `[50]` is one thumb, `[20, 80]` is a range.

## Examples

### Range

<!-- demo: slider-range -->

### Vertical

<!-- demo: slider-vertical -->

### Reactive forms

<!-- demo: slider-reactive-forms -->

## API

Every part also accepts `class`.

### iv-slider

Works with `formControl`, `formControlName` and `ngModel`.

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `number[] \| null` | `null` (one thumb at `min`) | One number per thumb. |
| `min` | `number` | `0` | Lowest value. |
| `max` | `number` | `100` | Highest value. |
| `step` | `number` | `1` | Values snap to this grid. |
| `disabled` | `boolean` | `false` | Blocks pointer and keys. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Vertical needs a height on the parent. |
| `aria-label` | `string` | | Moved to every thumb. |
| `aria-labelledby` | `string` | | Moved to every thumb. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `number[]` | The new values. |

## Accessibility

- Each thumb is `role="slider"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`.
- Arrows move one step. Page Up and Page Down move ten steps. Home and End go to the ends.
- Thumbs never cross.

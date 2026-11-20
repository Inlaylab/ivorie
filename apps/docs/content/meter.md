---
title: Meter
description: A measured amount in a known range, as a tick bar with a label at each end.
section: component
entry: '@inlaylab/ivorie/meter'
---

For storage, seats or quota. Use progress for a task that finishes.

## Usage

```ts
import { IvMeter } from '@inlaylab/ivorie/meter';
```

```html
<iv-meter [value]="68" label="Storage" valueText="68 GB of 100 GB" />
```

## Examples

### Status

`low`, `high` and `optimum` mark the good part of the range, like the HTML `meter`. Outside it the bar turns to a warning or bad color.

<!-- demo: meter-status -->

### Solid

<!-- demo: meter-solid -->

## API

Every part also accepts `class`.

### iv-meter

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | `0` | Clamped to `min`–`max`. |
| `min` | `number` | `0` | Start of the range. |
| `max` | `number` | `100` | End of the range. |
| `low` | `number` | — | Below this is the low part of the range. |
| `high` | `number` | — | Above this is the high part of the range. |
| `optimum` | `number` | middle | Where the best value sits. |
| `ticks` | `number` | `24` | Number of ticks. `0` draws a solid bar. |
| `label` | `string` | `''` | Shown at the start. Names the meter. |
| `valueText` | `string` | `''` | Shown at the end, and read out instead of the number. |
| `aria-label` | `string` | — | Name when there is no `label`. |

## Accessibility

The track has `role="meter"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`. `label` names it through `aria-labelledby`; `valueText` is the `aria-valuetext`.

## Notes

`data-status` is `good`, `warn` or `bad` when `low` or `high` is set. Each filled tick has `data-filled`.

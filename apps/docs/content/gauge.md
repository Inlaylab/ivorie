---
title: Gauge
description: One value in a range, as a ring of segments or a row of capsules.
section: component
entry: '@inlaylab/ivorie/gauge'
---

## Usage

```ts
import { IvGauge } from '@inlaylab/ivorie/gauge';
```

```html
<iv-gauge [value]="72" caption="Uptime" label="Uptime" />
```

## Examples

### Capsule

<!-- demo: gauge-capsule -->

## API

Every part also accepts `class`.

### iv-gauge

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | `0` | Clamped to `min`–`max`. |
| `min` | `number` | `0` | Start of the range. |
| `max` | `number` | `100` | End of the range. |
| `shape` | `'radial' \| 'capsule'` | `'radial'` | A 270° ring, or a row of capsules. |
| `segments` | `number` | 24 / 10 | Number of segments. |
| `valueText` | `string` | percent | The value as text, like `"99.2%"`. |
| `caption` | `string` | `''` | A small line under the value. |
| `minLabel` | `string` | `min` | The text at the ring's start. |
| `maxLabel` | `string` | `max` | The text at the ring's end. |
| `label` | `string` | `''` | Names the gauge for screen readers. |

## Accessibility

`role="meter"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`. Set `label` to name it. The segments and the scale at the ring's ends are hidden from screen readers.

## Notes

The radial gauge is `w-40`; set its size with `class`. Each filled segment has `data-filled`.

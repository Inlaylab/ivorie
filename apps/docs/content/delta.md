---
title: Delta
description: A change against the last period, with an arrow and a good or bad color.
section: component
entry: '@inlaylab/ivorie/delta'
---

## Usage

```ts
import { IvDelta } from '@inlaylab/ivorie/delta';
```

```html
<iv-delta [value]="12" />
```

## Examples

### Lower is better

`invert` makes a fall good: latency, errors, cost.

<!-- demo: delta-invert -->

## API

Every part also accepts `class`.

### iv-delta

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | `0` | The change. Its sign sets the arrow. |
| `format` | `'percent' \| 'number'` | `'percent'` | `percent` adds a `%`. |
| `invert` | `boolean` | `false` | Down is good. |
| `valueText` | `string` | signed value | The text, like `"+12%"`. |

## Accessibility

The arrow is hidden. Screen readers hear words: "Up 12%", "Down 3.5%" or "No change".

## Notes

`data-trend` is `up`, `down` or `flat`. `data-tone` is `good`, `bad` or `neutral`.

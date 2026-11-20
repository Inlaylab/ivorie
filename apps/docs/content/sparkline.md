---
title: Sparkline
description: A tiny trend line for a stat or a table cell, with no axes.
section: component
entry: '@inlaylab/ivorie/sparkline'
---

## Usage

```ts
import { IvSparkline } from '@inlaylab/ivorie/sparkline';
```

```html
<svg ivSparkline [data]="[4, 8, 6, 10, 9, 14]"></svg>
```

## API

Every part also accepts `class`.

### svg[ivSparkline]

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `number[]` | `[]` | The points, left to right. Needs two or more. |
| `type` | `'line' \| 'area'` | `'line'` | `area` fills under the line. |
| `label` | `string` | `''` | Makes it a named image. Without it, it is hidden. |

## Accessibility

Hidden from screen readers by default: say the trend in text next to it. With `label`, it is `role="img"` with that name.

## Notes

It draws in `currentColor`; color it with a `text-*` class. Size it with `h-*` and `w-*`; the line keeps its width.

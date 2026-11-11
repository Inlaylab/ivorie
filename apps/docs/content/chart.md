---
title: Chart
description: A responsive SVG chart container that colors series from a config.
section: component
entry: '@inlaylab/ivorie/chart'
---

Wrap chart parts in `iv-chart`. Each key in `config` becomes the CSS variable `--color-<key>`.

## Usage

```ts
import { IvChart } from '@inlaylab/ivorie/chart';
```

```html
<iv-chart [config]="config"></iv-chart>
```

## API

Every part also accepts `class`.

### iv-chart

| Name | Type | Default | Description |
|---|---|---|---|
| `config` | `IvChartConfig` | required | Series by key: `label`, `icon`, and a `color` or a `theme` of `light` and `dark`. |
| `initialDimension` | `IvChartSize` | `{ width: 320, height: 200 }` | Size used until the container is measured. |

### svg[ivLineChart], svg[ivAreaChart]

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `IvChartDatum[]` | required | Rows. A `null` or missing value leaves a gap. |
| `margin` | `IvChartMargin` | `5` each side | Space around the plot. |
| `stackOffset` | `'none' \| 'expand'` | `'none'` | Area only. `expand` scales each stack to 0–1. |
| `ariaLabel` | `string` | series names | Label of the chart (`role="img"`). |

### g[ivXAxis], g[ivYAxis]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | `''` | Row key for category ticks. |
| `type` | `'category' \| 'number'` | X `'category'`, Y `'number'` | Ticks from rows or from the value scale. |
| `hide` | `boolean` | `false` | Hide the axis and free its space. |
| `tickLine` | `boolean` | `true` | Draw tick marks. |
| `axisLine` | `boolean` | `true` | Draw the axis line. |
| `tickMargin` | `number` | `8` | Gap between tick and label. |
| `tickFormatter` | `(value, index) => string` | — | Formats a tick label. |
| `width` | `number` | `60` | Y only. Space for the labels. |

### g[ivCartesianGrid]

| Name | Type | Default | Description |
|---|---|---|---|
| `vertical` | `boolean` | `true` | Lines at each category. |
| `horizontal` | `boolean` | `true` | Lines at each value tick. |

### g[ivLine], g[ivArea]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | required | Row key of the values. Color: `var(--color-<dataKey>)`. |
| `curve` | `'linear' \| 'natural' \| 'step' \| 'monotone' \| 'bump'` | `'linear'` | Curve type. |
| `stroke` | `string` | series color | Line color. |
| `strokeWidth` | `number` | line `2`, area `1` | Line width. |
| `dot` | `boolean \| TemplateRef<IvDotContext>` | line `true`, area `false` | Dots, or a template given `IvDot`. |
| `activeDot` | `boolean` | `true` | Dot at the active row. |
| `fill` | `string` | series color | Area only. |
| `fillOpacity` | `number` | `0.4` | Area only. |
| `stackId` | `string` | — | Area only. Areas with the same id stack, in markup order. |

## Accessibility

The container has no role. Chart roots are `role="img"` with an `aria-label` (default: the chart type and series names).

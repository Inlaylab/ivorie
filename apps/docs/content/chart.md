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

### svg[ivLineChart], svg[ivAreaChart], svg[ivBarChart]

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `IvChartDatum[]` | required | Rows. A `null` or missing value leaves a gap. |
| `margin` | `IvChartMargin` | `5` each side | Space around the plot. |
| `stackOffset` | `'none' \| 'expand'` | `'none'` | Area and bar. `expand` scales each stack to 0–1. |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Bar only. `vertical` puts categories on Y and draws horizontal bars. |
| `barGap` | `number \| string` | `4` | Bar only. Gap between the bars of one category: px or a percent of the band. |
| `barCategoryGap` | `number \| string` | `'10%'` | Bar only. Gap on each side of a category: px or a percent of the band. |
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
| `minTickGap` | `number` | `5` | Category axis. Hides a tick whose label would be closer than this to the next shown one. The last tick stays. Label width is estimated (12px text). |
| `tickCount` | `number` | `5` | Number axis. About how many value ticks; the grid follows it. |
| `height` | `number` | `30` | X only. Space for the labels. |
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

### g[ivBar]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | required | Row key of the values. Color: `var(--color-<dataKey>)`. A row's own `fill` colors its bar. |
| `stackId` | `string` | — | Bars with the same id stack, in markup order. Others sit side by side. |
| `radius` | `number \| [number, number, number, number]` | `0` | Corner radius, or `[topLeft, topRight, bottomRight, bottomLeft]`. The top is the bar's tip. |
| `fill` | `string` | series color | Bar color. |
| `activeIndex` | `number` | — | The highlighted bar (`data-active`). Default: the bar under the cursor. |

### g[ivLabelList]

Put it inside `g[ivBar]`, `g[ivLine]` or `g[ivArea]`.

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | series key | Row key of the label text. |
| `position` | `'top' \| 'inside' \| 'insideLeft' \| 'right' \| 'outside'` | `'top'` | Where the label sits. A negative bar's `top` is its tip. |
| `offset` | `number` | `12` | Distance from the item, in px. |
| `formatter` | `(value) => string` | — | Formats the label. |

## Accessibility

The container has no role. Chart roots are `role="img"` with an `aria-label` (default: the chart type and series names).

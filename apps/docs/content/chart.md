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

Every part also accepts `class`. Boolean inputs take a bare attribute, like shadcn's JSX: `<g ivXAxis hide>`.

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
| `activeIndex` | `number` | — | The highlighted bar (`data-active`, or the `ivActiveShape` template). Default: the bars under the cursor. |

### g[ivLabelList]

Put it inside `g[ivBar]`, `g[ivLine]`, `g[ivArea]`, `g[ivPie]`, `g[ivRadialBar]` or `g[ivRadar]`.

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | series key | Row key of the label text. |
| `position` | `'top' \| 'inside' \| 'insideLeft' \| 'right' \| 'outside'` | `'top'` | Where the label sits. A negative bar's `top` is its tip. On a sector, `outside` is beyond the outer radius; any other value is the centroid. |
| `offset` | `number` | `12` | Distance from the item, in px. |
| `formatter` | `(value) => string` | — | Formats the label. |

### svg[ivPieChart], svg[ivRadarChart], svg[ivRadialChart]

Angles are degrees, as in Recharts: 0 is 3 o'clock, positive is counter-clockwise.

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `IvChartDatum[]` | `[]` | Rows. A pie may bring its own. |
| `startAngle` | `number` | radar `90`, others `0` | Where the sweep starts. |
| `endAngle` | `number` | radar `-270`, others `360` | Where the sweep ends. The radar default goes clockwise from the top. |
| `innerRadius` | `number \| string` | `0` | px or a percent of half the smaller side. |
| `outerRadius` | `number \| string` | `'80%'` | px or a percent of half the smaller side. |
| `ariaLabel` | `string` | series names | Label of the chart (`role="img"`). |

### g[ivPie]

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `IvChartDatum[]` | chart `data` | Rows of this pie. |
| `dataKey` | `string` | required | Row key of the values. A `null` value skips the row. All 0 draws nothing. |
| `nameKey` | `string` | `'name'` | Row key of the sector name. Color: the row's `fill`, else `var(--color-<name>)`. |
| `innerRadius` | `number \| string` | chart's | Over 0 makes a donut. |
| `outerRadius` | `number \| string` | chart's | Several pies with different radii make rings. |
| `paddingAngle` | `number` | `0` | Degrees between sectors. |
| `stroke` | `string` | none | Sector outline. |
| `strokeWidth` | `number` | `1` | Outline width. |
| `activeIndex` | `number` | — | The highlighted sector (`data-active`, or the `ivActiveShape` template). Default: the sector under the cursor, in this ring. |
| `label` | `boolean \| TemplateRef<IvPieLabelContext>` | `false` | Values outside the sectors, or a template given `IvPieLabel`. |
| `labelLine` | `boolean` | `true` | A line from each sector to its label. |

### ng-template[ivChartLabel]

Center content, rendered in the SVG. Put it inside `g[ivPie]`, `g[ivRadialBar]` or `g[ivPolarRadiusAxis]`. The context is `{ cx, cy, innerRadius, outerRadius }`: `let-box` for all, `let-cx="cx"` for one.

### g[ivPolarGrid]

| Name | Type | Default | Description |
|---|---|---|---|
| `gridType` | `'polygon' \| 'circle'` | `'polygon'` | Ring shape. |
| `radialLines` | `boolean` | `true` | A spoke per angle tick. |
| `polarRadius` | `number[]` | radius ticks | Ring radii in px. |
| `stroke` | `string` | theme border | Line color. |

`class` goes on each ring, as in Recharts, so `first:fill-muted` works.

### g[ivPolarAngleAxis]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | `''` | Row key of the labels around the outside. |
| `tick` | `boolean \| TemplateRef<IvPolarAngleTickContext>` | `true` | Labels, or a template given `IvPolarAngleTick`. |
| `tickFormatter` | `(value, index) => string` | — | Formats a label. |

### g[ivPolarRadiusAxis]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | `''` | Radial charts: row key of the ring labels. |
| `tick` | `boolean` | `false` | Value labels along the spoke. |
| `axisLine` | `boolean` | `false` | The spoke line. |
| `angle` | `number` | `0` | The spoke's angle. |
| `orientation` | `'left' \| 'right' \| 'middle'` | `'right'` | Label side. |
| `domain` | `[number, number]` | 0 to the largest value | Radar: a fixed value range. |
| `tickFormatter` | `(value, index) => string` | — | Formats a label. |

### g[ivRadar]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | required | Row key of the values. A `null` value leaves the vertex out. |
| `fill` | `string` | series color | Fill color. |
| `fillOpacity` | `number` | `0.6` | Fill opacity. |
| `stroke` | `string` | none | Outline color. |
| `strokeWidth` | `number` | — | Outline width. |
| `dot` | `boolean \| TemplateRef<IvDotContext>` | `false` | Dots on the vertices, or a template given `IvDot`. |
| `activeDot` | `boolean` | `true` | Dot at the active row's vertex. |

### g[ivRadialBar]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | required | Row key of the values. A ring per row, from the inside out. The largest value fills the sweep. |
| `background` | `boolean` | `false` | A muted track over the whole sweep. |
| `cornerRadius` | `number` | `0` | Rounds the bar ends. |
| `stackId` | `string` | — | Bars with the same id share a ring and stack. |
| `fill` | `string` | series color | Bar color. A row's own `fill` wins. |

### iv-chart-tooltip

Put it inside `iv-chart`. It opens on the active row: the pointer (hover, or a tap on touch), the keyboard, or `defaultIndex`. Labels, icons and colors come from the config.

| Name | Type | Default | Description |
|---|---|---|---|
| `indicator` | `'dot' \| 'line' \| 'dashed'` | `'dot'` | Indicator shape. With one row, `line` and `dashed` move the label into the row. |
| `hideLabel` | `boolean` | `false` | Hide the label (the category, or the config label of the series). |
| `hideIndicator` | `boolean` | `false` | Hide the indicators. |
| `nameKey` | `string` | — | Row key whose string value names each row's config entry (a pie's sector names). |
| `labelKey` | `string` | — | Config key of the label. |
| `labelFormatter` | `(label, payload) => string` | — | Formats the label. |
| `formatter` | `(value, name, item, index) => string` | — | Replaces each row with text. For markup, use `ivChartTooltipContent`. |
| `cursor` | `boolean` | `true` | A muted band (bar), line (line, area) or spoke (radar) under the active row. |
| `defaultIndex` | `number` | — | Opens on this row at start. Rendered on the server too. |

`class` goes on the `cn-chart-tooltip` card. The tooltip sits 10px past the pointer, on the side with more room, inside the chart box.

### ng-template[ivChartTooltipContent]

A custom tooltip body inside the card. The context is the rows (`$implicit: IvChartPayload[]`) and `label`, the category value: `let-payload let-label="label"`.

### iv-chart-legend

Put it inside `iv-chart`. A swatch, or the config `icon`, and the config label per series (per sector on a pie). The chart leaves room for it.

| Name | Type | Default | Description |
|---|---|---|---|
| `verticalAlign` | `'top' \| 'bottom'` | `'bottom'` | Above or under the chart. |
| `hideIcon` | `boolean` | `false` | Show the swatch even when the config has an `icon`. |
| `nameKey` | `string` | — | Row key whose string value names each item's config entry (a pie's sector names). |

### ng-template[ivActiveShape]

Draws the active item instead of its default shape, inside `g[ivBar]` or `g[ivPie]`. The active item is `activeIndex`, or the one under the cursor. `let-shape` gives `IvActiveShapeProps`: the item, `d` (its default path) and, on a pie, the sector (`cx`, `cy`, radii, angles) for `ivArc`.

```html
<g ivPie dataKey="visitors" nameKey="browser" [innerRadius]="60" [activeIndex]="0">
  <ng-template ivActiveShape let-shape>
    <svg:path [attr.d]="grow(shape)" [attr.fill]="shape.fill" />
  </ng-template>
</g>
```

```ts
grow = (shape: IvSectorShape) => ivArc({ ...shape, outerRadius: shape.outerRadius + 10 });
```

## Accessibility

The container has no role. Chart roots are `role="img"` with an `aria-label` (default: the chart type and series names).

Each chart root is one tab stop (`tabindex="0"`), like Recharts' `accessibilityLayer` Keyboard focus shows a ring (`focus-visible:outline-ring/50`).

| Key | Action |
|---|---|
| ArrowRight / ArrowLeft | Next / previous row. Wraps. Vertical bar charts and polar charts use ArrowDown / ArrowUp. |
| Home / End | First / last row. |
| Escape | Hide the tooltip. |

While the chart has focus, the tooltip is an `aria-live="polite"` region, so the row is read out.

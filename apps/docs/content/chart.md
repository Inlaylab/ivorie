---
title: Chart
description: SVG charts built from small parts. Line, area, bar, pie, radar and radial.
section: component
entry: '@inlaylab/ivorie/chart'
---

Charts are made of parts: a container, a chart root, then grid, axes, series, tooltip and legend. You add only the parts you need. The parts and their inputs follow [Recharts](https://recharts.org), so shadcn's chart examples port almost line by line.

Browse ready-made cards in [Area Charts](docs/charts-area), [Bar Charts](docs/charts-bar), [Line Charts](docs/charts-line), [Pie Charts](docs/charts-pie), [Radar Charts](docs/charts-radar), [Radial Charts](docs/charts-radial) and [Tooltips](docs/charts-tooltip).

## Usage

```ts
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';
```

```html
<iv-chart [config]="config" class="min-h-[200px] w-full">
  <svg ivBarChart [data]="data">
    <g ivCartesianGrid [vertical]="false" />
    <g ivXAxis dataKey="month" />
    <g ivBar dataKey="desktop" [radius]="4" />
  </svg>
  <iv-chart-tooltip />
  <iv-chart-legend />
</iv-chart>
```

The `svg` root and its `g` parts are real SVG elements. Angular renders them on the server too.

## Your first chart

Build the bar chart at the top of this page, one step at a time.

### 1. Define your data

Any array of objects works. Each key is a column you can draw.

```ts
protected readonly data = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];
```

### 2. Define your config

The config names and colors each series. It holds no data, so many charts can share one.

```ts
protected readonly config: IvChartConfig = {
  desktop: { label: 'Desktop', color: '#2563eb' },
  mobile: { label: 'Mobile', color: '#60a5fa' },
};
```

### 3. Build your chart

Put a chart root inside `iv-chart`, and a series per data key. Give the container a height: a `min-h-*`, an `h-*` or an `aspect-*` class. Its default is `aspect-video`.

<!-- demo: chart -->

### 4. Add a grid

`g[ivCartesianGrid]` draws the lines. `[vertical]="false"` keeps only the horizontal ones.

<!-- demo: chart-bar-demo-grid -->

### 5. Add an axis

`g[ivXAxis]` labels each row with its `dataKey`. `tickFormatter` shortens the labels.

<!-- demo: chart-bar-demo-axis -->

### 6. Add a tooltip

Put `iv-chart-tooltip` inside `iv-chart`, after the chart root. Hover a bar. Labels and colors come from the config.

<!-- demo: chart-bar-demo-tooltip -->

### 7. Add a legend

`iv-chart-legend` lists each series with its config label. The chart makes room for it.

<!-- demo: chart-bar-demo-legend -->

That is your first chart. Next, browse the gallery pages or read the API below.

## Config

The config maps each data key to a `label`, an optional `icon`, and a `color` or a `theme`.

```ts
import { IvChartConfig } from '@inlaylab/ivorie/chart';

protected readonly config: IvChartConfig = {
  desktop: {
    label: 'Desktop',
    icon: MonitorIcon,
    // A color...
    color: '#2563eb',
  },
  mobile: {
    label: 'Mobile',
    // ...or a light and a dark color.
    theme: { light: '#60a5fa', dark: '#93c5fd' },
  },
};
```

- `label` names the series in the tooltip and the legend.
- `icon` is any component. The tooltip and the legend draw it in place of the swatch. To use an `<ng-icon>`, wrap it in a small component.
- Each key becomes a CSS custom property, `--color-<key>`, on `iv-chart`. Use simple identifiers as keys: letters, digits, `-` and `_`, no spaces.
- One `dataKey` names one series. Two series with the same `dataKey` in one chart collide (tooltip rows, legend, stacks and the active point mix them up). Give each its own key.

## Theming

Use CSS variables (recommended), or any color: hex, `hsl`, `oklch`.

### CSS variables

The theme defines `--chart-1` to `--chart-5`, for light and dark mode. Point the config at them:

```ts
protected readonly config: IvChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
};
```

Change them in your styles to recolor every chart:

```css
:root {
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
}
.dark {
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
}
```

### A theme per series

`theme` sets a light and a dark color for one series. Dark applies under a `.dark` ancestor.

```ts
protected readonly config: IvChartConfig = {
  desktop: { label: 'Desktop', theme: { light: '#2563eb', dark: '#60a5fa' } },
};
```

### Using the colors

A series uses `var(--color-<dataKey>)` by default. Use the same variable anywhere inside `iv-chart`:

- In an input: `<g ivBar dataKey="desktop" fill="var(--color-mobile)" />`.
- In data: `{ browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' }`. A row's `fill` colors its bar, sector or tooltip row.
- In a class: `<g ivLabelList class="fill-(--color-desktop)" />`.
- In a gradient: `<linearGradient id="fillDesktop">` ids are page-wide. If a component that draws a chart renders more than once on a page, make the id unique per instance (for example with `IvIdGenerator.next('fill')` from `@inlaylab/ivorie/core`) and use it in `fill="url(#…)"`.

## Tooltip

A tooltip shows a label, a name, an indicator and a value per series.

<!-- demo: chart-tooltip-demo -->

Pick the indicator with `indicator`: `dot`, `line` or `dashed`. Hide parts with `hideLabel` and `hideIndicator`. Add `[cursor]="false"` to drop the band or line under the active row.

```html
<iv-chart-tooltip indicator="line" hideLabel [cursor]="false" />
```

Names come from the config. `nameKey` and `labelKey` pick other config entries:

```ts
protected readonly data = [
  { browser: 'chrome', visitors: 187, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
];

protected readonly config: IvChartConfig = {
  visitors: { label: 'Total Visitors' },
  chrome: { label: 'Chrome', color: 'var(--chart-1)' },
  safari: { label: 'Safari', color: 'var(--chart-2)' },
};
```

```html
<!-- Label "Total Visitors", rows named "Chrome" and "Safari". -->
<iv-chart-tooltip labelKey="visitors" nameKey="browser" />
```

For your own markup, put an `ivChartTooltipContent` template inside. It gets the rows and the label:

```html
<iv-chart-tooltip hideLabel>
  <ng-template ivChartTooltipContent let-payload>
    @for (item of payload; track item.key) {
      <div class="flex items-center gap-2">
        {{ config[item.key]?.label }}
        <span class="ml-auto font-mono tabular-nums">{{ item.value }} kcal</span>
      </div>
    }
  </ng-template>
</iv-chart-tooltip>
```

To change only the rows and keep the card and label, use an `ivChartTooltipItem` template. It replaces the indicator, name and value of each row (Recharts' `formatter` returning markup):

```html
<iv-chart-tooltip hideLabel>
  <ng-template ivChartTooltipItem let-item let-label="label">
    {{ label }}
    <span class="ml-auto font-mono tabular-nums">{{ item.value }} kcal</span>
  </ng-template>
</iv-chart-tooltip>
```

## Legend

Put `iv-chart-legend` inside `iv-chart`. It shows a swatch, or the config `icon`, and the label per series. `verticalAlign="top"` puts it above the chart.

```html
<iv-chart-legend verticalAlign="top" />
```

Like the tooltip, `nameKey` picks the config entry by a row value, for example a pie's sector names:

```html
<iv-chart-legend nameKey="browser" />
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
| `aria-label` | `string` | chart type and series names | Label of the chart (`role="img"`). Set it as a plain attribute: `<svg ivBarChart aria-label="Revenue">`. |

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
| `dot` | `boolean \| IvDotProps \| TemplateRef<IvDotContext>` | line `true`, area `false` | Dots; circle props (`r`, `fill`, `stroke`, `strokeWidth`) over the default (`r` 3, background fill, series stroke); or a template given `IvDot`. |
| `activeDot` | `boolean \| IvDotProps` | `true` | Dot at the active row; circle props over the default (`r` 4, series fill, background stroke). |
| `fill` | `string` | series color | Area only. |
| `fillOpacity` | `number` | `0.6` | Area only, as in Recharts. |
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
| `position` | `'top' \| 'inside' \| 'insideLeft' \| 'right' \| 'outside' \| 'insideStart'` | `'top'` | Where the label sits. A negative bar's `top` is its tip. On a sector, `outside` is beyond the outer radius. On a radial bar, `insideStart` runs the text along the ring from the bar's start. Any other value on a sector is the centroid. |
| `offset` | `number` | `5` (px, or degrees for `insideStart`) | Distance from the item. |
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
| `margin` | `IvChartMargin` | `5` each side | Space around the chart. The center and radii fit the box left. Negative values grow the chart. |
| `aria-label` | `string` | chart type and series names | Label of the chart (`role="img"`). Set it as a plain attribute: `<svg ivPieChart aria-label="Browser share">`. |

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

`class` goes on each ring and spoke, as in Recharts, so `first:fill-muted` works on the rings. Spokes draw over the rings.

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
| `stroke` | `string` | muted | Axis line and tick text color, as in Recharts. |
| `domain` | `[number, number]` | 0 to the largest value | Radar: a fixed value range. |
| `tickFormatter` | `(value, index) => string` | — | Formats a label. |

### g[ivRadar]

| Name | Type | Default | Description |
|---|---|---|---|
| `dataKey` | `string` | required | Row key of the values. A `null` value leaves the vertex out. |
| `fill` | `string` | series color | Fill color. |
| `fillOpacity` | `number` | `1` | Fill opacity, as in Recharts. |
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
| `formatter` | `(value, name, item, index) => string` | — | Replaces each row with text. For markup, use `ivChartTooltipItem`. |
| `cursor` | `boolean` | `true` | A muted band (bar), line (line, area) or spoke (radar) under the active row. |
| `defaultIndex` | `number` | — | Opens on this row at start. Rendered on the server too. |

`class` goes on the `cn-chart-tooltip` card. The tooltip sits 10px past the pointer, on the side with more room, inside the chart box.

### ng-template[ivChartTooltipContent]

A custom tooltip body inside the card. The context is the rows (`$implicit: IvChartPayload[]`) and `label`, the category value: `let-payload let-label="label"`.

### ng-template[ivChartTooltipItem]

A custom row, inside the row's flex box. It replaces the indicator, name and value. Rows with no value or name keep the default. The context (`IvChartTooltipItemContext`):

| Name | Type | Description |
|---|---|---|
| `$implicit` | `IvChartPayload` | The row: `key`, `name`, `value`, `color`, `row` (the data row). |
| `value` | `unknown` | The row's value. |
| `name` | `string` | The series key (a pie: the sector name). |
| `label` | `string` | The config label, or `name`. |
| `color` | `string` | The indicator color. |
| `index` | `number` | The row's position. |
| `payload` | `IvChartPayload[]` | All rows, e.g. for a total after the last one. |

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

The container has no role. Chart roots are `role="img"` with an `aria-label` (default: the chart type and series names). Set your own with the plain `aria-label` attribute on the root.

Each chart root is one tab stop (`tabindex="0"`), like Recharts' `accessibilityLayer`. Keyboard focus shows a ring (`focus-visible:outline-ring/50`).

| Key | Action |
|---|---|
| ArrowRight / ArrowLeft | Next / previous row. Wraps. Vertical bar charts and polar charts use ArrowDown / ArrowUp. |
| Home / End | First / last row. |
| Escape | Hide the tooltip. Works while the chart has focus. |

While the chart has focus, the tooltip is an `aria-live="polite"` region, so the row is read out.

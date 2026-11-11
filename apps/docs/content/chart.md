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

## Accessibility

The container has no role. Parts add their own labels.

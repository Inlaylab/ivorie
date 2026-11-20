---
title: Tracker
description: A row of status bars, one per day or check, with a tooltip each.
section: component
entry: '@inlaylab/ivorie/tracker'
---

For uptime, CI runs and scheduled jobs.

## Usage

```ts
import { IvTracker, type IvTrackerItem } from '@inlaylab/ivorie/tracker';
```

```html
<iv-tracker [data]="days" label="API uptime, last 30 days" />
```

## API

Every part also accepts `class`.

### iv-tracker

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `IvTrackerItem[]` | `[]` | One bar each: `status` (`ok` the accent, `warn` amber, `error` red, `none` muted) and `tooltip`. |
| `label` | `string` | `''` | Names the row. |

## Accessibility

A `group` named by `label`. Each bar is an image named by its tooltip. The row is one tab stop: Left and Right move between bars, Home and End go to the ends. The focused or hovered bar shows its tooltip.

## Notes

Each bar has `data-status`. The tooltip is drawn inside the row, so a long row needs no overlay per bar.

`ok` bars are green, `warn` orange and `error` red in every theme. Set `--tracker-ok` to choose the ok color yourself, for example `--tracker-ok: var(--primary);`.

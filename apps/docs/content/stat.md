---
title: Stat
description: A key number with an icon chip, a label, a change and an optional sparkline or meter.
section: component
entry: '@inlaylab/ivorie/stat'
---

## Usage

```ts
import { IV_STAT_IMPORTS } from '@inlaylab/ivorie/stat';
import { IvDelta } from '@inlaylab/ivorie/delta';
```

```html
<iv-stat>
  <iv-stat-header>
    <iv-stat-icon><svg ivIcon="info"></svg></iv-stat-icon>
    <iv-stat-label>Revenue</iv-stat-label>
  </iv-stat-header>
  <iv-stat-value>$48,200 <iv-delta [value]="12" /></iv-stat-value>
  <iv-stat-description>vs. last month</iv-stat-description>
</iv-stat>
```

## Examples

### With a meter

<!-- demo: stat-meter -->

## API

Every part also accepts `class`.

### iv-stat

The tile. A column of the parts below, then anything else, like a sparkline or a meter.

### iv-stat-header

The top row: icon chip, label, and an optional action at the end.

### iv-stat-icon

A small square chip for an icon. Hidden from screen readers.

### iv-stat-label

What the number is.

### iv-stat-value

The number. Put an `iv-delta` after it.

### iv-stat-description

A line of context under the value.

## Accessibility

The parts are plain text in reading order: label, value, change, description. The icon chip is hidden from screen readers. Give a sparkline a `label` only when it says something the text does not.

## Notes

Each theme gives the tile its own pane: Bento nests it in a well, Glass frosts it.

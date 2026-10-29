---
title: Progress
description: A horizontal progress bar from 0 to 100.
section: component
entry: '@ivorie/ui/progress'
---

Set `value` to bind it. Set it to `null` for indeterminate.

## Usage

```ts
import { IvProgress } from '@ivorie/ui/progress';
```

```html
<iv-progress [value]="uploadPercent"></iv-progress>
```

## Examples

### Indeterminate

<!-- demo: progress-indeterminate -->

## API

Every part also accepts `class`.

### iv-progress

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| null` | `0` | Percent, clamped to 0–100. `null` or `NaN` means indeterminate. |

## Accessibility

`role="progressbar"` with `aria-valuemin="0"` and `aria-valuemax="100"`. `aria-valuenow` is the clamped value and is absent when indeterminate. Add `aria-label` or `aria-labelledby` to name it.

## Notes

`data-state` is `loading`, `complete` (at 100) or `indeterminate`.

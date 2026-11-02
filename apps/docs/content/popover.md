---
title: Popover
description: Rich content in a panel that opens from a button.
section: component
entry: '@inlaylab/ivorie/popover'
---

## Usage

```ts
import { IV_POPOVER_IMPORTS } from '@inlaylab/ivorie/popover';
```

```html
<iv-popover>
  <button ivButton ivPopoverTrigger>Open</button>
  <iv-popover-content>
    <iv-popover-title>Title</iv-popover-title>
    Content
  </iv-popover-content>
</iv-popover>
```

## Examples

### Align

<!-- demo: popover-align -->

## API

Every part also accepts `class`.

### iv-popover

| Name | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` (two-way) | `false` | Open state. |

### iv-popover-content

| Name | Type | Default | Description |
|---|---|---|---|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Side of the trigger. Flips when there is no room. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along that side. |
| `sideOffset` | `number` | `4` | Gap to the trigger, in px. |
| `alignOffset` | `number` | `0` | Shift along the side, in px. |

### Other parts

- `[ivPopoverTrigger]`: toggles the popover.
- `[ivPopoverAnchor]`: positions the content against this element instead of the trigger.
- `iv-popover-header`, `iv-popover-title`, `iv-popover-description`.

## Accessibility

- The content is `role="dialog"`, labelled by `iv-popover-title`.
- Opening moves focus into the content. Tab stays inside. Escape or a click outside closes it and returns focus to the trigger.

---
title: Tooltip
description: A short label shown on hover or focus.
section: component
entry: '@inlaylab/ivorie/tooltip'
---

Shows a short label next to a trigger. The panel renders in a CDK overlay with an arrow.

## Usage

```ts
import { IV_TOOLTIP_IMPORTS } from '@inlaylab/ivorie/tooltip';
```

```html
<iv-tooltip>
  <button ivTooltipTrigger>Hover me</button>
  <iv-tooltip-content>This is a tooltip</iv-tooltip-content>
</iv-tooltip>
```

## Examples

### Provider

<!-- demo: tooltip-provider -->

### Delay

<!-- demo: tooltip-delay -->

### Side and align

<!-- demo: tooltip-side-align -->

### Icon button

<!-- demo: tooltip-icon-button -->

### Truncate

<!-- demo: tooltip-truncate -->

## API

Every part also accepts `class`.

### iv-tooltip-provider

Sets the default delay for every tooltip in its subtree.

| Name | Type | Default | Description |
|---|---|---|---|
| `delayDuration` | `number` | `0` | Delay in ms before tooltips open. |

### iv-tooltip

| Name | Type | Default | Description |
|---|---|---|---|
| `delayDuration` | `number \| undefined` | `undefined` | Per-tooltip delay in ms. Wins over the provider and the global token. |

### ivTooltipTrigger

Directive on the trigger element. No inputs.

### iv-tooltip-content

| Name | Type | Default | Description |
|---|---|---|---|
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Side of the trigger. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side axis. |
| `sideOffset` | `number` | `6` | Gap to the trigger in px. |
| `hidden` | `boolean` | `false` | Keeps the tooltip closed and removes `aria-describedby`. |

### ivTruncateTooltip

Shows the full text on hover, only when the host is clipped (`scrollWidth > clientWidth`). The host must already clip, for example with `truncate`, or be an `<input>`. Built into `iv-select-trigger` and `iv-combobox-input`.

```html
<span class="truncate" [ivTruncateTooltip]="name">{{ name }}</span>
```

| Name | Type | Default | Description |
|---|---|---|---|
| `ivTruncateTooltip` | `string \| null \| undefined` | `''` | Tooltip text. Empty text never shows. |
| `ivTruncateTooltipSide` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Side of the host. |
| `ivTruncateTooltipMeasure` | `HTMLElement \| null` | `null` | Element checked for clipping. Defaults to the host. Use it when the hover area is wider than the text. |

### TooltipPanelComponent

Internal panel used by `ivTruncateTooltip`. You do not use it directly.

| Name | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `''` | Panel text. |
| `extraClass` | `string` | `''` | Extra classes for the panel. |

## Accessibility

- The panel has `role="tooltip"`.
- While open and not `hidden`, the trigger has `aria-describedby` pointing at the panel. An `aria-describedby` already on the trigger is kept.
- Opens on keyboard focus and closes on blur. Focus from a mouse press does not open it.
- Escape, a click and a mouse press close it.
- Moving the pointer from the trigger into the panel keeps it open.
- The arrow is `aria-hidden`.

## Notes

- Delay order: `delayDuration` on `iv-tooltip`, then the nearest `iv-tooltip-provider`, then the `IV_TOOLTIP_DELAY` token. The token reads `tooltipDelay` from `IV_CONFIG` and falls back to `0`.
- Wrap the app shell in `<iv-tooltip-provider [delayDuration]="0">` for instant tooltips.
- The panel mounts only while open.
- `ivTruncateTooltip` waits 200 ms, and hides on leave, press and blur.

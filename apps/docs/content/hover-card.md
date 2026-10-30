---
title: Hover Card
description: Rich content in a floating panel shown on hover.
section: component
entry: '@inlaylab/ivorie/hover-card'
---

Shows a card next to a trigger after a hover delay. The card renders in a CDK overlay.

## Usage

```ts
import { IV_HOVER_CARD_IMPORTS } from '@inlaylab/ivorie/hover-card';
```

```html
<iv-hover-card>
  <a ivHoverCardTrigger href="#">@nextjs</a>
  <iv-hover-card-content>The React Framework</iv-hover-card-content>
</iv-hover-card>
```

## Examples

### Delays

<!-- demo: hover-card-delays -->

### Side and align

<!-- demo: hover-card-side-align -->

## API

Every part also accepts `class`.

### iv-hover-card

| Name | Type | Default | Description |
|---|---|---|---|
| `openDelay` | `number` | `200` | Ms before the card opens. |
| `closeDelay` | `number` | `150` | Ms before the card closes after the pointer or focus leaves. |

### ivHoverCardTrigger

Directive on the trigger element. No inputs.

### iv-hover-card-content

| Name | Type | Default | Description |
|---|---|---|---|
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Side of the trigger. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side axis. |
| `sideOffset` | `number` | `8` | Gap to the trigger in px. |
| `alignOffset` | `number` | `0` | Shift along the align axis in px. |

## Accessibility

- The trigger has `aria-expanded`, and `aria-controls` pointing at the card while open.
- Opens on hover or focus after `openDelay`. A click opens it at once.
- Closes on leave or blur after `closeDelay`, and on Escape.
- Moving from the trigger into the card, or back, keeps it open.

## Notes

- The card is not clipped by `overflow: hidden` ancestors.
- It mounts on first open.
- Set the width with `class`, for example `class="w-80"`.

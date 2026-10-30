---
title: Card
description: A container with header, content and footer parts.
section: component
entry: '@inlaylab/ivorie/card'
---

## Usage

```ts
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
```

```html
<iv-card>
  <iv-card-header>
    <iv-card-title>Account</iv-card-title>
    <iv-card-description>Manage your preferences.</iv-card-description>
  </iv-card-header>
  <iv-card-content>Body</iv-card-content>
</iv-card>
```

## Examples

### Action

<!-- demo: card-action -->

### Footer

<!-- demo: card-footer -->

### Small

<!-- demo: card-small -->

### Image

<!-- demo: card-image -->

### Header divider

<!-- demo: card-header-divider -->

## API

Every part also accepts `class`.

### iv-card

| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'default' \| 'sm'` | `'default'` | `sm` reduces gap, padding and font size in all child parts. Set it only on the card. |

### Other parts

No inputs besides `class`: `iv-card-header`, `iv-card-title`, `iv-card-description`, `iv-card-action`, `iv-card-content`, `iv-card-footer`.

## Accessibility

A card has no role. Use a real heading element for the title if the page outline needs one.

## Notes

- Put `iv-card-action` inside `iv-card-header`. It sits top right.
- Make `iv-card-footer` a direct child of `iv-card`.
- An `img` as first or last child gets rounded corners.
- Add `class="border-b"` to `iv-card-header` for a divider.

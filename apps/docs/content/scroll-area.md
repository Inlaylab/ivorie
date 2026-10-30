---
title: Scroll Area
description: A scrollable region with a thin, themed native scrollbar.
section: component
entry: '@inlaylab/ivorie/scroll-area'
---

Ports the shadcn/ui `ScrollArea`. It uses the browser's native scrolling and styles the scrollbar with CSS. No measuring, so it works with SSR.

## Usage

```ts
import { IV_SCROLL_AREA_IMPORTS } from '@inlaylab/ivorie/scroll-area';
```

```html
<iv-scroll-area maxHeight="300px">
  <div class="px-3 py-2 text-sm">Long content</div>
</iv-scroll-area>
```

## Examples

### Horizontal

<!-- demo: scroll-area-horizontal -->

### Both axes

<!-- demo: scroll-area-both-axes -->

### Fill parent

<!-- demo: scroll-area-fill-parent -->

## API

Every part also accepts `class`.

### iv-scroll-area

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | `'auto' \| 'always' \| 'scroll-x' \| 'scroll-y'` | `'auto'` | `auto`: scrollbars when content overflows. `always`: scrollbars always shown. `scroll-x`: horizontal only. `scroll-y`: vertical only. |
| `maxHeight` | `string` | `''` | CSS `max-height` of the viewport, for example `'300px'` or `'50vh'`. |
| `maxWidth` | `string` | `''` | CSS `max-width` of the viewport. |

## Accessibility

- The viewport has `tabindex="0"`, so keyboard users can focus it and scroll with the arrow, Page and Home/End keys.
- A focus ring shows on `:focus-visible`.

## Notes

- `class` goes on the host. The viewport fills the host (`size-full`) and inherits its border radius, so set `rounded-*` on the host.
- For a fixed height, set `maxHeight` or add an `h-*` class to the host.
- The scrollbar is 10px, with a transparent track and a `--border` colored thumb. Firefox uses `scrollbar-width: thin`.
- Styles target the `.iv-scroll-area-viewport` class only. They do not affect other scrollable elements.

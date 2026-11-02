---
title: Carousel
description: A row of slides with previous and next buttons.
section: component
entry: '@inlaylab/ivorie/carousel'
---

Built on CSS scroll snap, so touch, trackpad and wheel scrolling come from the browser. No extra dependency. There is no loop or autoplay.

## Usage

```ts
import { IV_CAROUSEL_IMPORTS } from '@inlaylab/ivorie/carousel';
```

```html
<iv-carousel aria-label="Photos">
  <iv-carousel-content>
    <iv-carousel-item>One</iv-carousel-item>
    <iv-carousel-item>Two</iv-carousel-item>
  </iv-carousel-content>
  <button ivCarouselPrevious></button>
  <button ivCarouselNext></button>
</iv-carousel>
```

## Examples

### Sizes

Set the slide width with `basis-*` classes.

<!-- demo: carousel-size -->

### Vertical

<!-- demo: carousel-vertical -->

## API

Every part also accepts `class`.

### iv-carousel

| Name | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Scroll direction. |

### button[ivCarouselPrevious], button[ivCarouselNext]

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `ButtonVariants['variant']` | `'outline'` | Button look. |
| `size` | `ButtonVariants['size']` | `'icon-sm'` | Button size. |

Each button scrolls one viewport.

### Other parts

- `iv-carousel-content` (the scroll track), `iv-carousel-item` (one slide).

## Accessibility

Give the carousel an `aria-label`. The buttons have screen reader labels "Previous slide" and "Next slide".

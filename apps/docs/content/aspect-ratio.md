---
title: Aspect Ratio
description: Keeps content at a fixed width-to-height ratio.
section: component
entry: '@inlaylab/ivorie/aspect-ratio'
---

Use it for images, videos and maps that must keep their shape as the width changes.

## Usage

```ts
import { IvAspectRatio } from '@inlaylab/ivorie/aspect-ratio';
```

```html
<iv-aspect-ratio [ratio]="16 / 9">
  <img src="photo.jpg" alt="Photo" class="size-full object-cover" />
</iv-aspect-ratio>
```

## Examples

### Square

<!-- demo: aspect-ratio-square -->

## API

Every part also accepts `class`.

### iv-aspect-ratio

| Name | Type | Default | Description |
|---|---|---|---|
| `ratio` | `number` | `1` | Width divided by height. |

## Accessibility

No role. Give images inside it an `alt`.

## Notes

- It uses the CSS `aspect-ratio` property. Children fill it with `size-full`.

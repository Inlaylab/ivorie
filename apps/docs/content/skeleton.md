---
title: Skeleton
description: A pulsing placeholder for loading content.
section: component
entry: '@inlaylab/ivorie/skeleton'
---

Size it with Tailwind utilities.

## Usage

```ts
import { IvSkeleton } from '@inlaylab/ivorie/skeleton';
```

```html
<iv-skeleton class="h-4 w-3/4"></iv-skeleton>
```

## Examples

### Card

<!-- demo: skeleton-card -->

## API

Every part also accepts `class`.

### iv-skeleton

No inputs besides `class`.

## Accessibility

It has no role and no text, so it is invisible to assistive tech. Mark the loading region with `aria-busy="true"` on the container.

---
title: Icon
description: The icons the components draw, from Lucide, with no icon package to install.
section: component
entry: '@inlaylab/ivorie/icon'
---

The components draw their icons with `IvIcon`. The shapes are copied from [Lucide](https://lucide.dev), so you do not install an icon package for Ivorie.

`@lucide/angular` is one 10 MB file. Dev servers do not tree-shake it, so every reload loads all of it. Ivorie does not use it.

## Usage

```ts
import { IvIcon } from '@inlaylab/ivorie/icon';
```

```html
<svg ivIcon="chevron-down" class="size-4"></svg>
```

Only the names shown above are built in. For other icons in your app, pick any icon package you like.

## API

### svg[ivIcon]

| Name | Type | Default | Description |
|---|---|---|---|
| `ivIcon` | `IconName` | required | Which icon to draw. |
| `size` | `number` | `24` | Width and height in px. A `size-*` class wins over it. |

Also exported: `ICONS` (the shape data), `IconName`, `IconNode`.

## Accessibility

Icons are decorative: `aria-hidden="true"`. Give the button or link its own label, for example `aria-label="Close"`.

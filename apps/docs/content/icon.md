---
title: Icon
description: Draws the components' icons, and any Lucide icon you add, with no Angular icon package.
section: component
entry: '@inlaylab/ivorie/icon'
---

The components draw their icons with `IvIcon`. The shapes come from [Lucide](https://lucide.dev), so you install nothing for them.

## Usage

```ts
import { IvIcon } from '@inlaylab/ivorie/icon';
```

```html
<svg ivIcon="chevron-down" class="size-4"></svg>
```

The names shown above are built in.

## Examples

### Any Lucide icon

Install the plain `lucide` package and pass the icon to `ivIcon`. It is typed, and the build keeps only the icons you import.

```bash
npm i lucide
```

```ts
import { House } from 'lucide';
// in the component: protected readonly House = House;
```

```html
<svg [ivIcon]="House" class="size-4"></svg>
```

<!-- demo: icon-lucide -->

## Why not `@lucide/angular`

`@lucide/angular` is one 10 MB file. `ng serve` does not tree-shake packages, so the browser loads all of it on every reload. The plain `lucide` package is icon data only (about 1 MB for every icon) and fits `IvIcon` as is.

shadcn/ui for React imports icons from `lucide-react` in each component. Ivorie keeps the same Lucide look without that cost.

## API

### svg[ivIcon]

| Name | Type | Default | Description |
|---|---|---|---|
| `ivIcon` | `IconName \| IconNode` | required | A built-in name, or icon data such as `House` from `lucide`. |
| `size` | `number` | `24` | Width and height in px. A `size-*` class wins over it. |

Also exported: `ICONS` (the built-in shapes), `IconName`, `IconNode` (the same shape as Lucide's).

### [ivIconAttrs]

Internal to `IvIcon`: `ivIconAttrs` sets one shape's attributes. Exported only because `IvIcon` uses it.

Icon data is code you import. Event handler (`on*`) and `href` attributes in it are dropped.

## Accessibility

Icons are decorative: `aria-hidden="true"`. Give the button or link its own label, for example `aria-label="Close"`.

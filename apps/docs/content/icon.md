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

### Icon library

The components draw Lucide by default. To draw Tabler, Phosphor, Hugeicons or Remix, provide that library's set once:

```ts
import { provideIvIcons } from '@inlaylab/ivorie/icon';
import { COMPONENT_ICONS } from '@inlaylab/ivorie/icons/tabler';

providers: [provideIvIcons(COMPONENT_ICONS)]
```

Each set holds only the 18 icons the components use. For your own icons, use `<ng-icon>` from [ng-icons](https://ng-icons.github.io/ng-icons) with the same library. `npx ivorie migrate icons` switches them for you. Size an `<ng-icon>` with its `size` input (`size="1rem"`) or the font size, and color it from its parent. A `size-*` or `text-*` class on the `<ng-icon>` itself does not apply.

## Why not `@lucide/angular`

`@lucide/angular` is one 10 MB file. `ng serve` does not tree-shake packages, so the browser loads all of it on every reload. The plain `lucide` package is icon data only (about 1 MB for every icon) and fits `IvIcon` as is.

shadcn/ui for React imports icons from `lucide-react` in each component. Ivorie keeps the same Lucide look without that cost.

## API

### svg[ivIcon]

| Name | Type | Default | Description |
|---|---|---|---|
| `ivIcon` | `IconName \| IconData \| IconNode` | required | A built-in name, `IconData`, or a Lucide `IconNode` such as `House` from `lucide`. |
| `size` | `number` | `24` | Width and height in px. A `size-*` class wins over it. |

Also exported: `ICONS` (the built-in shapes), `IconName`, `IconNode` (the same shape as Lucide's), `IconData`, `IconSvg`, `IconSet`, `LUCIDE_ICONS`, `LUCIDE_SVG`, `IV_ICONS` and `provideIvIcons(set)`.

### [ivIconShape]

Internal to `IvIcon`: `ivIconShape` binds one shape's attributes. Exported only because `IvIcon` uses it.

Only shape and drawing attributes are drawn. Event handler (`on*`) and `href` attributes in icon data never reach the page.

## Accessibility

Icons are decorative: `aria-hidden="true"`. Give the button or link its own label, for example `aria-label="Close"`.

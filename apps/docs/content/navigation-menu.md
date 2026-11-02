---
title: Navigation Menu
description: Site links with panels that open on hover or click.
section: component
entry: '@inlaylab/ivorie/navigation-menu'
---

## Usage

```ts
import { IV_NAVIGATION_MENU_IMPORTS } from '@inlaylab/ivorie/navigation-menu';
```

```html
<iv-navigation-menu>
  <ul ivNavigationMenuList>
    <li ivNavigationMenuItem>
      <button ivNavigationMenuTrigger>Docs</button>
      <iv-navigation-menu-content>
        <a ivNavigationMenuLink href="docs/installation">Installation</a>
      </iv-navigation-menu-content>
    </li>
  </ul>
</iv-navigation-menu>
```

## API

Every part also accepts `class`.

### iv-navigation-menu

| Name | Type | Default | Description |
|---|---|---|---|
| `aria-label` | `string` | `'Main'` | Label of the inner `nav`. |

### li[ivNavigationMenuItem]

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` | auto id | Item key. |

### a[ivNavigationMenuLink]

| Name | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | `false` | Marks the current page (`aria-current="page"`). |

### Other parts

- `ul[ivNavigationMenuList]`.
- `button[ivNavigationMenuTrigger]`: opens its item's panel. Adds a chevron.
- `iv-navigation-menu-content`: the panel, shown under the menu. It slides in from the side of the last open panel.
- `navigationMenuTriggerStyle`: classes to make a plain link look like a trigger.

## Accessibility

- A `nav` landmark with a list of links.
- Triggers have `aria-expanded` and `aria-controls`. Down arrow opens the panel and focuses its first link.
- Escape closes the panel and returns focus to its trigger. A click outside closes it.

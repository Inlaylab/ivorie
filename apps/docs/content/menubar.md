---
title: Menubar
description: A row of menus, like the one at the top of a desktop app.
section: component
entry: '@inlaylab/ivorie/menubar'
---

Each menu uses the [Dropdown Menu](docs/dropdown-menu) parts. `IV_MENUBAR_IMPORTS` includes them.

## Usage

```ts
import { IV_MENUBAR_IMPORTS } from '@inlaylab/ivorie/menubar';
```

```html
<iv-menubar>
  <iv-menubar-menu>
    <button ivMenubarTrigger>File</button>
    <iv-dropdown-menu-content>
      <iv-dropdown-menu-item>New tab</iv-dropdown-menu-item>
    </iv-dropdown-menu-content>
  </iv-menubar-menu>
</iv-menubar>
```

## API

Every part also accepts `class`.

- `iv-menubar`: the bar.
- `iv-menubar-menu`: one menu.
- `button[ivMenubarTrigger]`: opens its menu.

Content and items: see [Dropdown Menu](docs/dropdown-menu).

## Accessibility

- The bar is `role="menubar"`; triggers are `role="menuitem"` with one tab stop.
- Left and Right move between triggers, and between menus when one is open.
- Down, Enter or Space opens a menu at its first item. Once a menu is open, hovering another trigger switches to it.

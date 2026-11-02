---
title: Context Menu
description: A menu that opens at the pointer on right-click.
section: component
entry: '@inlaylab/ivorie/context-menu'
---

The menu parts are the [Dropdown Menu](docs/dropdown-menu) parts. `IV_CONTEXT_MENU_IMPORTS` includes them.

## Usage

```ts
import { IV_CONTEXT_MENU_IMPORTS } from '@inlaylab/ivorie/context-menu';
```

```html
<iv-context-menu>
  <div ivContextMenuTrigger>Right-click here</div>
  <iv-dropdown-menu-content>
    <iv-dropdown-menu-item>Copy</iv-dropdown-menu-item>
  </iv-dropdown-menu-content>
</iv-context-menu>
```

## API

### [ivContextMenuTrigger]

| Name | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Keep the browser menu. |

Content, items, groups, checkbox and radio items, and sub menus: see [Dropdown Menu](docs/dropdown-menu).

## Accessibility

- Right-click or the keyboard context-menu key opens it. The browser menu is blocked.
- Keys inside the menu work as in Dropdown Menu. Escape closes it.

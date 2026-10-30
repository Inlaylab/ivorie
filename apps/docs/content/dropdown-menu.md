---
title: Dropdown Menu
description: A menu of actions opened from a trigger.
section: component
entry: '@inlaylab/ivorie/dropdown-menu'
---

A composable action menu with checkbox items, radio groups and sub menus. It renders in a CDK overlay.

## Usage

```ts
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';
```

```html
<iv-dropdown-menu>
  <button ivButton ivDropdownMenuTrigger variant="outline" size="sm">Open</button>
  <iv-dropdown-menu-content>
    <iv-dropdown-menu-item>Profile</iv-dropdown-menu-item>
    <iv-dropdown-menu-item>Billing</iv-dropdown-menu-item>
  </iv-dropdown-menu-content>
</iv-dropdown-menu>
```

## Examples

### Label, separator and shortcut

<!-- demo: dropdown-menu-label-separator-shortcut -->

### Checkbox items

<!-- demo: dropdown-menu-checkbox-items -->

### Radio group

<!-- demo: dropdown-menu-radio-group -->

### Submenu

<!-- demo: dropdown-menu-submenu -->

### Inset items and alignment

<!-- demo: dropdown-menu-inset-align -->

## API

Every part also accepts `class`.

### iv-dropdown-menu

Root. Holds the open state. No inputs.

### ivDropdownMenuTrigger

Directive on the trigger element. No inputs.

### iv-dropdown-menu-content

| Name | Type | Default | Description |
|---|---|---|---|
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment along the side axis. |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Side of the trigger. |
| `sideOffset` | `number` | `4` | Gap to the trigger in px. |
| `alignOffset` | `number` | `0` | Shift along the align axis in px. |

### iv-dropdown-menu-item

| Name | Type | Default | Description |
|---|---|---|---|
| `inset` | `boolean` | `false` | Indents the item to line up with items that have an indicator. |
| `disabled` | `boolean` | `false` | Skips the item for focus and selection. |
| `variant` | `'default' \| 'destructive'` | `'default'` | Visual variant. |
| `closeOnSelect` | `boolean` | `true` | `false` keeps the menu open after selection. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `select` | `MouseEvent \| KeyboardEvent` | Fires on click, Enter or Space. |

### iv-dropdown-menu-checkbox-item

| Name | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | `false` | Two-way model: `[(checked)]`. |
| `disabled` | `boolean` | `false` | Skips the item for focus and selection. |
| `inset` | `boolean` | `false` | Indents the item. |
| `closeOnSelect` | `boolean` | `false` | `true` closes the menu after toggling. |

### iv-dropdown-menu-radio-group

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` | `null` | Selected item value. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `string` | Fires when an item is picked. |

### iv-dropdown-menu-radio-item

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Value of this item. |
| `disabled` | `boolean` | `false` | Skips the item for focus and selection. |
| `inset` | `boolean` | `false` | Indents the item. |
| `closeOnSelect` | `boolean` | `true` | `false` keeps the menu open after selection. |

### iv-dropdown-menu-label

| Name | Type | Default | Description |
|---|---|---|---|
| `inset` | `boolean` | `false` | Indents the label. |

### iv-dropdown-menu-sub-trigger

Item that opens a sub menu. Place it inside `iv-dropdown-menu-sub`.

| Name | Type | Default | Description |
|---|---|---|---|
| `inset` | `boolean` | `false` | Indents the item. |
| `disabled` | `boolean` | `false` | Blocks opening the sub menu. |

### iv-dropdown-menu-sub-content

Panel of a sub menu. Opens to the right, and flips to the left when there is no room. No inputs.

### Other parts

`iv-dropdown-menu-group`, `iv-dropdown-menu-separator`, `iv-dropdown-menu-shortcut` and `iv-dropdown-menu-sub` have no inputs. The shortcut text is visual only: bind the key yourself.

## Accessibility

- The trigger has `aria-haspopup="menu"` and `aria-expanded`.
- The panel has `role="menu"`. Items use `role="menuitem"`, `menuitemcheckbox` or `menuitemradio`. Checkbox and radio items set `aria-checked`. Groups use `role="group"`, separators `role="separator"`.
- Disabled items set `aria-disabled` and are skipped by the arrow keys.
- A sub-trigger has `aria-haspopup="menu"` and `aria-expanded`.
- Focus moves into the menu on open: to the first or last item for keyboard, to the menu for pointer. Closing returns focus to the trigger.
- A click outside the menu closes it. A transparent backdrop catches the click.
- A mouse click on a link inside an item follows the link.

| Key | Where | Does |
|---|---|---|
| Enter, Space, ArrowDown | trigger | Opens, focuses the first item. |
| ArrowUp | trigger | Opens, focuses the last item. |
| ArrowDown, ArrowUp | menu | Next or previous item. Wraps, skips disabled. |
| Home, End | menu | First or last item. |
| a to z | menu | Focuses the next item that starts with the typed text. |
| Enter, Space | item | Activates it. Closes the menu unless `closeOnSelect` is `false`. |
| ArrowRight, Enter, Space | sub-trigger | Opens the sub menu, focuses its first item. |
| ArrowLeft, Escape | sub menu | Closes it, focuses the sub-trigger. |
| Escape | menu | Closes, focuses the trigger. |
| Tab | menu | Closes the whole menu, focuses the root trigger. |

## Notes

- A sub menu closes when its parent closes.
- Picking an item closes the whole menu tree.

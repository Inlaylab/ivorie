---
title: Item
description: A composable row for action lists, settings and rich menu rows.
section: component
entry: '@ivorie/ui/item'
---

## Usage

```ts
import { IV_ITEM_IMPORTS } from '@ivorie/ui/item';
```

```html
<iv-item-group>
  <iv-item variant="outline">
    <iv-item-content>
      <iv-item-title>Profile</iv-item-title>
      <p ivItemDescription>Manage your account details.</p>
    </iv-item-content>
  </iv-item>
</iv-item-group>
```

## Examples

### Media and actions

<!-- demo: item-media-actions -->

### Sizes

<!-- demo: item-sizes -->

### Header and footer

<!-- demo: item-header-footer -->

### Separator

<!-- demo: item-separator -->

## API

Every part also accepts `class`.

### iv-item

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'outline' \| 'muted'` | `'default'` | Visual style. |
| `size` | `'default' \| 'sm' \| 'xs'` | `'default'` | Padding and gap. |

### iv-item-media

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'icon' \| 'image'` | `'default'` | `icon` frames an icon. `image` frames a picture. |

### Other parts

No inputs besides `class`: `iv-item-group`, `iv-item-content`, `iv-item-title`, `iv-item-description` (or `p[ivItemDescription]`), `iv-item-actions`, `iv-item-header`, `iv-item-footer`, `iv-item-separator`.

## Accessibility

`iv-item-group` has `role="list"`. An `iv-item` that is a direct child of the group gets `role="listitem"`. Nested items get no role. `iv-item-separator` has `role="none"`. Items show a focus ring when focused.

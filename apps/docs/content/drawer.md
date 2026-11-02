---
title: Drawer
description: A panel from an edge of the screen that you can drag to close.
section: component
entry: '@inlaylab/ivorie/drawer'
---

A drawer is a [Sheet](docs/sheet) with a drag gesture. Drag it more than a quarter of its size toward its edge and it closes with reason `'drag'`. A shorter drag springs back. It uses the [Dialog](docs/dialog) service, close reasons and focus rules.

## Usage

```ts
import { IV_DRAWER_IMPORTS } from '@inlaylab/ivorie/drawer';
```

```html
<button ivButton [ivDrawerTrigger]="drawer">Open</button>
<ng-template #drawer>
  <iv-drawer-header>
    <iv-drawer-title>Title</iv-drawer-title>
  </iv-drawer-header>
</ng-template>
```

Or open it from code: `inject(IvDrawer).open(MyComponent, { direction: 'right' })`. It returns an `IvDialogRef`.

## Examples

### Direction

<!-- demo: drawer-direction -->

## API

Every part also accepts `class`.

### DrawerConfig

All [Dialog](docs/dialog) config options except `size`, `height` and `showCloseButton`, plus:

| Name | Type | Default | Description |
|---|---|---|---|
| `direction` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Edge the drawer comes from. |

### [ivDrawerTrigger]

| Name | Type | Default | Description |
|---|---|---|---|
| `ivDrawerTrigger` | `TemplateRef \| Type` | required | Content to show. |
| `ivDrawerConfig` | `DrawerConfig` | `{}` | Options. |

Outputs: `opened` (`IvDialogRef`), `closed` (`DialogCloseEvent`).

### [ivDrawerClose]

| Name | Type | Default | Description |
|---|---|---|---|
| `ivDrawerClose` | `unknown` | `undefined` | Result passed to `afterClosed`. |
| `reason` | `DialogCloseReason` | `'close-button'` | Close reason. |

### Other parts

- `iv-drawer-header`, `iv-drawer-title`, `iv-drawer-description`, `iv-drawer-footer`.

## Accessibility

Same as Dialog: `role="dialog"` with `aria-modal`, labelled by the title, focus trapped inside, Escape closes, focus returns to the opener. Dragging is optional: a drawer can always close with Escape or a button.

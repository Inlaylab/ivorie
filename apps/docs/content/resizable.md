---
title: Resizable
description: Panels with drag handles between them.
section: component
entry: '@inlaylab/ivorie/resizable'
---

Sizes are percent of the group. Drag a handle, or focus it and use the arrow keys.

## Usage

```ts
import { IV_RESIZABLE_IMPORTS } from '@inlaylab/ivorie/resizable';
```

```html
<iv-resizable-panel-group class="rounded-lg border">
  <iv-resizable-panel defaultSize="30" minSize="20">One</iv-resizable-panel>
  <iv-resizable-handle />
  <iv-resizable-panel>Two</iv-resizable-panel>
</iv-resizable-panel-group>
```

## Examples

### Handle

<!-- demo: resizable-handle -->

## API

Every part also accepts `class`.

### iv-resizable-panel-group

| Name | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction panels are laid out in. |

Output: `layoutChange` (`number[]`): sizes in percent after a drag or key press.

### iv-resizable-panel

| Name | Type | Default | Description |
|---|---|---|---|
| `defaultSize` | `number` | equal share | Start size in percent. |
| `minSize` | `number` | `0` | Smallest size in percent. |
| `maxSize` | `number` | `100` | Largest size in percent. |

### iv-resizable-handle

| Name | Type | Default | Description |
|---|---|---|---|
| `withHandle` | `boolean` | `false` | Shows a grip. |
| `aria-label` | `string \| null` | `'Resize'` | Label for the handle. |

## Accessibility

Each handle is a focusable `separator` with its value in percent. Arrow keys move it.

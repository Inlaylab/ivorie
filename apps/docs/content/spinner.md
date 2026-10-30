---
title: Spinner
description: An inline spinning loader.
section: component
entry: '@ivorie/ui/spinner'
---

Wraps the Lucide `LoaderCircle` icon.

## Usage

```ts
import { IvSpinner } from '@ivorie/ui/spinner';
```

```html
<iv-spinner></iv-spinner>
```

## Examples

### Size and colour

<!-- demo: spinner-size -->

### In a button

<!-- demo: spinner-button -->

## API

Every part also accepts `class`.

### iv-spinner

| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `number` | `16` | Icon size in px. |
| `label` | `string` | `'Loading'` | Accessible name, set as `aria-label`. |

## Accessibility

`role="status"` with `aria-label` from `label`. The icon itself is `aria-hidden`. Set `label` to something specific, such as "Saving".

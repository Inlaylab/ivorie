---
title: Toggle
description: A button that turns on and off.
section: component
entry: '@inlaylab/ivorie/toggle'
---

## Usage

```ts
import { IvToggle } from '@inlaylab/ivorie/toggle';
```

```html
<button ivToggle aria-label="Toggle bold" [(pressed)]="bold"><svg lucideBold></svg></button>
```

## Examples

### Outline with text

<!-- demo: toggle-outline -->

### Disabled

<!-- demo: toggle-disabled -->

## API

Every part also accepts `class`.

### button[ivToggle]

| Name | Type | Default | Description |
|---|---|---|---|
| `pressed` | `boolean` (two-way) | `false` | On or off. |
| `variant` | `'default' \| 'outline'` | `'default'` | Visual style. |
| `size` | `'default' \| 'sm' \| 'lg'` | `'default'` | Height and padding. |

Disable it with the native `disabled` attribute.

## Accessibility

A native button with `aria-pressed`. Space and Enter toggle it. An icon-only toggle needs an `aria-label`.

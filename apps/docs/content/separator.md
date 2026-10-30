---
title: Separator
description: A thin divider for horizontal or vertical layouts.
section: component
entry: '@ivorie/ui/separator'
---

## Usage

```ts
import { IvSeparator } from '@ivorie/ui/separator';
```

```html
<iv-separator></iv-separator>
```

## Examples

### Vertical

<!-- demo: separator-vertical -->

## API

Every part also accepts `class`.

### iv-separator

| Name | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction. Sets `data-orientation`. |
| `decorative` | `boolean` | `true` | When `true`, the role is `none`. Set `false` for a semantic separator. |

## Accessibility

Decorative (default): `role="none"`. Not decorative: `role="separator"` plus `aria-orientation` set to the orientation.

## Notes

A vertical separator needs a parent with a height, for example `flex h-5 items-center`.

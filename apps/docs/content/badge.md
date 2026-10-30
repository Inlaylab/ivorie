---
title: Badge
description: A small inline pill for status, counts, tags and labels.
section: component
entry: '@ivorie/ui/badge'
---

Use it for status, counts, tags, or inline warnings.

## Usage

```ts
import { IvBadge } from '@ivorie/ui/badge';
```

```html
<iv-badge>New</iv-badge>
```

## Examples

### Variants

<!-- demo: badge-variants -->

### With icon

<!-- demo: badge-icon -->

### In a card action

<!-- demo: badge-card-action -->

## API

Every part also accepts `class`.

### iv-badge

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost' \| 'link'` | `'default'` | Visual style. |

## Accessibility

A badge is plain inline content with no role. Do not rely on colour alone to show status: put the meaning in the text.

## Notes

- Direct `svg` children are sized automatically.
- There is no `asChild`. To make a link, wrap the badge in an `a`, or use `variant="link"` for the look.

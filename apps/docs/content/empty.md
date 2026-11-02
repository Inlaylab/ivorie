---
title: Empty
description: A placeholder for an empty list, page or search result.
section: component
entry: '@inlaylab/ivorie/empty'
---

Tell users why the area is empty and what they can do next.

## Usage

```ts
import { IV_EMPTY_IMPORTS } from '@inlaylab/ivorie/empty';
```

```html
<iv-empty>
  <iv-empty-header>
    <iv-empty-media variant="icon"><svg lucideInbox aria-hidden="true"></svg></iv-empty-media>
    <iv-empty-title>No messages</iv-empty-title>
    <iv-empty-description>New messages show up here.</iv-empty-description>
  </iv-empty-header>
  <iv-empty-content>
    <button ivButton>Compose</button>
  </iv-empty-content>
</iv-empty>
```

## Examples

### Outline

<!-- demo: empty-outline -->

## API

Every part also accepts `class`.

### iv-empty-media

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'icon'` | `'default'` | `icon` puts the content in a muted square. |

Other parts: `iv-empty`, `iv-empty-header`, `iv-empty-title`, `iv-empty-description`, `iv-empty-content`. They have no inputs.

## Accessibility

Plain content with no role. Mark decorative icons `aria-hidden="true"`.

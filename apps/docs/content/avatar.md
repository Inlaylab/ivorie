---
title: Avatar
description: A circular avatar with image, fallback, status badge and group support.
section: component
entry: '@ivorie/ui/avatar'
---

The fallback shows until the image has loaded. It stays if the image fails.

## Usage

```ts
import { IV_AVATAR_IMPORTS } from '@ivorie/ui/avatar';
```

```html
<iv-avatar>
  <iv-avatar-image src="/me.png" alt="Ada Lovelace"></iv-avatar-image>
  <iv-avatar-fallback>AL</iv-avatar-fallback>
</iv-avatar>
```

## Examples

### Sizes

<!-- demo: avatar-sizes -->

### Badge

<!-- demo: avatar-badge -->

### Group

<!-- demo: avatar-group -->

## API

Every part also accepts `class`.

### iv-avatar

| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'default' \| 'sm' \| 'lg'` | `'default'` | Avatar size. Children (badge, fallback text) scale with it. |

### iv-avatar-image

| Name | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | required | Image URL. |
| `alt` | `string` | `''` | Alternative text. |

### iv-avatar-fallback

No inputs besides `class`. Hidden once the image has loaded.

### iv-avatar-badge

No inputs besides `class`. Status dot at the bottom right. At `sm` size, svg children are hidden.

### iv-avatar-group

No inputs besides `class`. Overlaps its avatars with a background ring.

### iv-avatar-group-count

No inputs besides `class`. An overflow chip such as `+3`.

## Accessibility

Give the image a meaningful `alt`. For a person, use their name. The fallback text is the visible stand-in, so keep it short, for example initials.

## Notes

With SSR the image may finish loading before hydration. The image checks its state once after first render, so the fallback still resolves correctly.

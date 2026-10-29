---
title: Button
description: A styled button or link with variants and sizes.
section: component
entry: '@ivorie/ui/button'
---

Apply `ivButton` to a native `button` or `a` element.

## Usage

```ts
import { IvButton } from '@ivorie/ui/button';
```

```html
<button ivButton>Save</button>
```

## Examples

### Variants

<!-- demo: button-variants -->

### Sizes

<!-- demo: button-sizes -->

### Icon

<!-- demo: button-icon -->

### Link

<!-- demo: button-link -->

## API

Every part also accepts `class`.

### button[ivButton], a[ivButton]

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'outline' \| 'secondary' \| 'ghost' \| 'destructive' \| 'link'` | `'default'` | Visual style. |
| `size` | `'default' \| 'xs' \| 'sm' \| 'lg' \| 'icon' \| 'icon-xs' \| 'icon-sm' \| 'icon-lg'` | `'default'` | Height and padding. The `icon-*` sizes make a square button. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native `type`. Set only on `button`, never on `a`. |

## Accessibility

It is a native `button` or `a`, so keyboard and focus work as usual. Icon-only buttons need an `aria-label`. The default `type="button"` stops accidental form submits. Disabled buttons get `pointer-events-none` and reduced opacity.

## Notes

`buttonVariants` and `ButtonVariants` are also exported, to style other elements like a button.

---
title: Collapsible
description: A trigger that shows or hides a region, with a height animation.
section: component
entry: '@inlaylab/ivorie/collapsible'
---

Ports the shadcn/ui `Collapsible`. The height animates with a CSS grid transition. No `@angular/animations` needed.

## Usage

```ts
import { IV_COLLAPSIBLE_IMPORTS } from '@inlaylab/ivorie/collapsible';
```

```html
<iv-collapsible [(open)]="isOpen">
  <button ivCollapsibleTrigger>Advanced settings</button>
  <iv-collapsible-content>Hidden content.</iv-collapsible-content>
</iv-collapsible>
```

## Examples

### Open by default

<!-- demo: collapsible-open-by-default -->

### Disabled

<!-- demo: collapsible-disabled -->

### Animated chevron

<!-- demo: collapsible-animated-chevron -->

## API

Every part also accepts `class`.

### iv-collapsible

| Name | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Open state. Two-way bindable with `[(open)]`. |
| `disabled` | `boolean` | `false` | Blocks toggling. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `openChange` | `boolean` | The open state changed. Use with `[(open)]`. |

### ivCollapsibleTrigger

Attribute directive for the element that toggles. Put it on a `<button>` or any element. No inputs.

### iv-collapsible-content

The expandable region. No own inputs.

## Accessibility

- The trigger has `aria-expanded` and `aria-controls` pointing at the content id.
- A `<button>` trigger keeps native behavior. Any other element gets `role="button"`, `tabindex="0"`, and toggles on Enter and Space.
- A disabled non-button trigger sets `aria-disabled` and `tabindex="-1"`. A disabled `<button>` gets the `disabled` attribute.
- Closed content is `inert`. Its links and fields are not focusable and are hidden from assistive tech.

## Notes

- `data-state="open" | "closed"` is set on the root, trigger and content. Use it for styling, for example `group-data-[state=open]:rotate-90` on a chevron.
- Closed content stays in the DOM so the height can animate.

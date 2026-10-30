---
title: Accordion
description: Vertically stacked sections that expand and collapse.
section: component
entry: '@inlaylab/ivorie/accordion'
---

Sections with a heading trigger and a collapsible body. Open one at a time or many. Ports the shadcn/ui `Accordion`.

## Usage

```ts
import { IV_ACCORDION_IMPORTS } from '@inlaylab/ivorie/accordion';
```

```html
<iv-accordion type="single">
  <iv-accordion-item value="profile">
    <iv-accordion-trigger>Profile</iv-accordion-trigger>
    <iv-accordion-content>Manage your name, email and avatar.</iv-accordion-content>
  </iv-accordion-item>
</iv-accordion>
```

## Examples

### Multiple

<!-- demo: accordion-multiple -->

### Controlled

<!-- demo: accordion-controlled -->

### Disabled

<!-- demo: accordion-disabled -->

## API

Every part also accepts `class`.

### iv-accordion

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | `'single' \| 'multiple'` | `'single'` | One open item at a time, or any number. |
| `collapsible` | `boolean` | `true` | In `single` mode, allow closing the open item. |
| `value` | `string \| string[] \| null` | - | Open item values. A `string` for `single`, a `string[]` for `multiple`. Bind with `[(value)]`. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `string \| string[] \| null` | The open set changed. `single` emits one value or `null`. `multiple` emits an array. |

### iv-accordion-item

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Unique key within the accordion. |
| `disabled` | `boolean` | `false` | Disables the trigger. |

### iv-accordion-trigger

Renders a `<button>` inside an `<h3>` with a chevron icon. No own inputs.

### iv-accordion-content

Body shown when the item is open. No own inputs.

## Accessibility

- The trigger is a `<button>` in an `<h3>` with `aria-expanded` and `aria-controls`.
- The content has `role="region"` and `aria-labelledby` pointing at its trigger.
- Enter and Space toggle the item.
- Down and Up move between triggers and wrap. Home and End go to the first and last trigger. Disabled triggers are skipped.
- Only keys pressed on a trigger count. Arrows inside a field in a panel, or in a nested accordion, stay there.
- A disabled item disables its `<button>`.

## Notes

- Trigger and content must sit inside `iv-accordion-item`. The item must sit inside `iv-accordion`.
- Closed content is `hidden`. `data-state="open" | "closed"` is set on the item, trigger and content.

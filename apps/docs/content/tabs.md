---
title: Tabs
description: Switch between panels of related content, one at a time.
section: component
entry: '@ivorie/ui/tabs'
---

Tabs with horizontal and vertical layout and two list styles (`default` pill, `line` underline). Ports the shadcn/ui `Tabs`.

## Usage

```ts
import { IV_TABS_IMPORTS } from '@ivorie/ui/tabs';
```

```html
<iv-tabs defaultValue="account">
  <iv-tabs-list>
    <iv-tabs-trigger value="account">Account</iv-tabs-trigger>
    <iv-tabs-trigger value="password">Password</iv-tabs-trigger>
  </iv-tabs-list>
  <iv-tabs-content value="account">Account settings.</iv-tabs-content>
  <iv-tabs-content value="password">Change your password.</iv-tabs-content>
</iv-tabs>
```

## Examples

### Controlled

<!-- demo: tabs-controlled -->

### Line

<!-- demo: tabs-line -->

### Vertical

<!-- demo: tabs-vertical -->

### Icons

<!-- demo: tabs-icons -->

### Disabled

<!-- demo: tabs-disabled -->

## API

Every part also accepts `class`.

### iv-tabs

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | - | Active tab. Bind with `[(value)]` for controlled use. |
| `defaultValue` | `string` | `''` | Initial active tab. Used only while `value` is not set. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout and arrow-key axis. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `valueChange` | `string` | The user selected a different tab. |

### iv-tabs-list

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'line'` | `'default'` | `default` is a muted pill. `line` is an underline. |

### iv-tabs-trigger

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Identifies the tab. Must match an `iv-tabs-content` value. |
| `disabled` | `boolean` | `false` | Blocks activation and is skipped by arrow keys. |

### iv-tabs-content

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | The trigger value that shows this panel. |

## Accessibility

- The list has `role="tablist"` and `aria-orientation`. Triggers have `role="tab"`, `aria-selected` and `aria-controls`. Panels have `role="tabpanel"`, `aria-labelledby` and `tabindex="0"`.
- Activation is automatic: arrow keys move focus and select the tab.
- Left and Right move in horizontal mode (flipped in RTL). Up and Down move in vertical mode. Focus wraps and skips disabled tabs.
- Home and End go to the first and last enabled tab. Enter and Space also select.
- Only the selected tab is in the Tab order. If none is selected, the first enabled tab is.
- Disabled triggers set `aria-disabled`.
- Give `iv-tabs-list` an `aria-label` when the tabs have no visible heading.
- Tabs nested in a panel keep their own keys. Arrows move only within their own list.

## Notes

- Panels use `hidden`. They stay in the DOM and are not re-created on switch.
- A parent that rejects a change and keeps the same `value` does not reset the tab. Accept the change, or set the value on the next tick.
- `IvTabs.select(value)` selects a tab from code. `IvTabsTrigger.isActive` is a signal.

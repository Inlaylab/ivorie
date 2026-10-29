---
title: Alert
description: A callout box with title, description and optional action.
section: component
entry: '@ivorie/ui/alert'
---

## Usage

```ts
import { IV_ALERT_IMPORTS } from '@ivorie/ui/alert';
```

```html
<iv-alert>
  <iv-alert-title>Heads up</iv-alert-title>
  <iv-alert-description>You can change your name in settings.</iv-alert-description>
</iv-alert>
```

## Examples

### Destructive

<!-- demo: alert-destructive -->

### Warning

<!-- demo: alert-warning -->

### Success

<!-- demo: alert-success -->

### Info

<!-- demo: alert-info -->

### With icon

<!-- demo: alert-icon -->

### With action

<!-- demo: alert-action -->

## API

Every part also accepts `class`.

### iv-alert

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'destructive' \| 'warning' \| 'success' \| 'info'` | `'default'` | Colour scheme. |

### Other parts

No inputs besides `class`: `iv-alert-title`, `iv-alert-description`, `iv-alert-action`.

## Accessibility

`iv-alert` has `role="alert"`, so screen readers announce it when it appears. Do not use colour alone to carry meaning.

## Notes

- Put an `svg` as a direct child of `iv-alert` for an icon. The title and description shift beside it.
- `iv-alert-action` sits at the top right. The alert adds right padding when it is present.
- `warning`, `success` and `info` use fixed Tailwind colours (`yellow`, `green`, `blue`), not theme tokens.

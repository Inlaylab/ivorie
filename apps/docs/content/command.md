---
title: Command
description: A search box with a filtered list of actions.
section: component
entry: '@inlaylab/ivorie/command'
---

Type to filter. Arrow keys move the highlight, Enter picks. Like shadcn's Command (cmdk).

## Usage

```ts
import { IV_COMMAND_IMPORTS } from '@inlaylab/ivorie/command';
```

```html
<iv-command>
  <iv-command-input placeholder="Search..." />
  <iv-command-list>
    <iv-command-empty>No results.</iv-command-empty>
    <iv-command-group heading="Suggestions">
      <iv-command-item (select)="run($event)">Calendar</iv-command-item>
    </iv-command-group>
  </iv-command-list>
</iv-command>
```

## Examples

### In a dialog

Put the command in a [Dialog](docs/dialog) template for a command palette.

<!-- demo: command-dialog -->

## API

Every part also accepts `class`.

### iv-command

| Name | Type | Default | Description |
|---|---|---|---|
| `search` | `string` (two-way) | `''` | The search text. |
| `shouldFilter` | `boolean` | `true` | `false` shows every item, e.g. when you filter on the server. |

### iv-command-input

| Name | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string \| null` | `null` | Placeholder text. |
| `aria-label` | `string \| null` | `'Search'` | Label for the input. |
| `disabled` | `boolean` | `false` | Disables the input. |

### iv-command-item

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` | item text | Text the search matches and `select` emits. |
| `keywords` | `string[]` | `[]` | Extra words the search matches. |
| `disabled` | `boolean` | `false` | Skipped by arrows, ignores clicks. |
| `checked` | `boolean` | `false` | Shows a check mark. |

Output: `select` (`string`): the item's value, on click or Enter.

### Other parts

- `iv-command-list`, `iv-command-empty` (shown when nothing matches), `iv-command-group` (`heading`), `iv-command-separator`, `iv-command-shortcut`.
- A group with no matching item hides.

## Accessibility

The input is a `combobox` that controls the `listbox`. The highlight uses `aria-activedescendant`, so focus stays in the input. Disabled items have `aria-disabled`.

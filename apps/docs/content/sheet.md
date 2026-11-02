---
title: Sheet
description: A dialog that slides in from an edge of the screen.
section: component
entry: '@inlaylab/ivorie/sheet'
---

A sheet is a [Dialog](docs/dialog) docked to an edge. It uses the same service, close reasons and focus rules.

## Usage

```ts
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
```

```html
<button ivButton [ivSheetTrigger]="sheet" [ivSheetConfig]="{ side: 'left' }">Open</button>
<ng-template #sheet>
  <iv-sheet-header>
    <iv-sheet-title>Title</iv-sheet-title>
  </iv-sheet-header>
</ng-template>
```

Or open it from code: `inject(IvSheet).open(MyComponent, { side: 'bottom' })`. It returns an `IvDialogRef`.

## Examples

### Side

<!-- demo: sheet-side -->

## API

Every part also accepts `class`.

### SheetConfig

All [Dialog](docs/dialog) config options except `size` and `height`, plus:

| Name | Type | Default | Description |
|---|---|---|---|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | Edge the sheet docks to. |

### [ivSheetTrigger]

| Name | Type | Default | Description |
|---|---|---|---|
| `ivSheetTrigger` | `TemplateRef \| Type` | required | Content to show. |
| `ivSheetConfig` | `SheetConfig` | `{}` | Options. |

Outputs: `opened` (`IvDialogRef`), `closed` (`DialogCloseEvent`).

### Other parts

- `iv-sheet-header`, `iv-sheet-title`, `iv-sheet-description`, `iv-sheet-footer`.
### [ivSheetClose]

| Name | Type | Default | Description |
|---|---|---|---|
| `ivSheetClose` | `unknown` | `undefined` | Result passed to `afterClosed`. |
| `reason` | `DialogCloseReason` | `'close-button'` | Close reason. |

## Accessibility

Same as Dialog: `role="dialog"` with `aria-modal`, labelled by the title, focus trapped inside, Escape closes, focus returns to the opener.

---
title: Alert Dialog
description: A modal that asks for an explicit choice.
section: component
entry: '@inlaylab/ivorie/alert-dialog'
---

A confirm dialog on CDK Overlay. A backdrop click never closes it. The user picks Cancel or Action.

## Usage

```ts
import { IvAlertDialog, IV_ALERT_DIALOG_IMPORTS } from '@inlaylab/ivorie/alert-dialog';
```

```html
<button ivButton [ivAlertDialogTrigger]="confirmTpl" (closed)="onClosed($event)">
  Delete account
</button>

<ng-template #confirmTpl>
  <iv-alert-dialog-header>
    <iv-alert-dialog-title>Delete account?</iv-alert-dialog-title>
    <iv-alert-dialog-description>This action cannot be undone.</iv-alert-dialog-description>
  </iv-alert-dialog-header>
  <iv-alert-dialog-footer>
    <button ivAlertDialogCancel>Cancel</button>
    <button ivAlertDialogAction variant="destructive">Delete</button>
  </iv-alert-dialog-footer>
</ng-template>
```

```ts
private alertDialog = inject(IvAlertDialog);
readonly confirmTpl = viewChild.required<TemplateRef<unknown>>('confirmTpl');

deleteUser() {
  const ref = this.alertDialog.open(this.confirmTpl(), { size: 'sm' });
  ref.afterClosed().subscribe(({ reason }) => {
    if (reason === 'action') this.doDelete();
  });
}
```

## Examples

### Service

<!-- demo: alert-dialog-service -->

### Media icon

<!-- demo: alert-dialog-media -->

### Result from action

<!-- demo: alert-dialog-result -->

### Small size

<!-- demo: alert-dialog-small -->

## API

Every part also accepts `class`.

### IvAlertDialog

Service, `providedIn: 'root'`.

| Method | Signature | Description |
|---|---|---|
| `open` | `<T, R, D>(content: Type<T> \| TemplateRef<unknown>, config?: AlertDialogConfig<D>) => IvAlertDialogRef<T, R>` | Opens an alert dialog. |

A template gets `$implicit` (the ref), `data` and `dialogRef` in its context. A component gets `IvAlertDialogRef` and `IV_ALERT_DIALOG_DATA` by injection.

### IvAlertDialogRef

| Member | Signature | Description |
|---|---|---|
| `close` | `(result?: R, reason?: AlertDialogCloseReason) => void` | Closes the dialog. `reason` defaults to `'programmatic'`. Only the first close counts. |
| `afterClosed` | `() => Observable<AlertDialogCloseEvent<R>>` | Emits once, then completes. |
| `closed` | `Signal<AlertDialogCloseEvent<R> \| undefined>` | `undefined` while open, then the close event. |
| `componentInstance` | `T \| undefined` | The live instance when opened with a component. |

### AlertDialogConfig

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `D` | `null` | Injected as `IV_ALERT_DIALOG_DATA`. Also in the template context as `data`. |
| `size` | `'default' \| 'sm'` | `'default'` | Width and footer layout. `sm` makes the footer a two-column grid. |
| `disableEscapeClose` | `boolean` | `false` | Escape does not close. |
| `panelClass` | `string \| string[]` | none | Extra classes on the overlay panel. |

### AlertDialogCloseEvent

`{ reason: AlertDialogCloseReason; result?: R }`.

| Reason | Meaning |
|---|---|
| `'action'` | An `ivAlertDialogAction` button. |
| `'cancel'` | An `ivAlertDialogCancel` button. |
| `'escape'` | Escape key. |
| `'programmatic'` | A `close()` call with no reason. |
| `'navigation'` | The overlay was disposed from outside, for example by a route change. |

### IV_ALERT_DIALOG_DATA

Injection token for the `data` passed to `open`.

### ivAlertDialogTrigger

Opens an alert dialog on click.

| Name | Type | Default | Description |
|---|---|---|---|
| `ivAlertDialogTrigger` | `Type<T> \| TemplateRef<unknown>` | required | What to open (class field `content`). |
| `ivAlertDialogConfig` | `AlertDialogConfig<D>` | `{}` | Config for `open`. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `opened` | `IvAlertDialogRef<T, R>` | Fires when the dialog opens. |
| `closed` | `AlertDialogCloseEvent<R>` | Fires when the dialog closes. |

### button[ivAlertDialogAction]

Closes with reason `'action'`. Styled as a button, so do not add `ivButton`.

| Name | Type | Default | Description |
|---|---|---|---|
| `ivAlertDialogAction` | `R` | `undefined` | Result passed to `close` (class field `result`). |
| `variant` | `ButtonVariants['variant']` | `'default'` | Button variant. |
| `size` | `ButtonVariants['size']` | `'default'` | Button size. |

### button[ivAlertDialogCancel]

Closes with reason `'cancel'`. Styled as a button, so do not add `ivButton`.

| Name | Type | Default | Description |
|---|---|---|---|
| `ivAlertDialogCancel` | `R` | `undefined` | Result passed to `close` (class field `result`). |
| `variant` | `ButtonVariants['variant']` | `'outline'` | Button variant. |
| `size` | `ButtonVariants['size']` | `'default'` | Button size. |

### iv-alert-dialog-header, iv-alert-dialog-footer, iv-alert-dialog-media, iv-alert-dialog-title, iv-alert-dialog-description

Layout parts. No inputs. Put `iv-alert-dialog-media` first in the header: the grid relies on source order.

## Accessibility

- The panel has `role="alertdialog"` and `aria-modal="true"`.
- It is labelled by `iv-alert-dialog-title` and described by `iv-alert-dialog-description`.
- Focus is trapped inside the panel. Cancel gets initial focus: the least destructive choice.
- On close, focus returns to the element that was focused before open. It is not moved if focus is already somewhere else outside the dialog. This runs before `afterClosed` emits.
- Escape closes the dialog, unless `disableEscapeClose` is set. Only the topmost overlay closes.
- Body scroll is blocked while open.

## Notes

- Action and Cancel inject `IvAlertDialogRef`, so use them inside a template or component opened by the service.
- `size` is set in the `open` config only. Layout children follow it.
- For a strict flow, set `disableEscapeClose: true`.

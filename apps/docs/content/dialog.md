---
title: Dialog
description: A modal window opened from a template or a component.
section: component
entry: '@ivorie/ui/dialog'
---

A modal dialog on CDK Overlay. Open a `TemplateRef` or a whole component. The close event tells you why it closed.

## Usage

```ts
import { IvDialog, IV_DIALOG_IMPORTS } from '@ivorie/ui/dialog';
```

```html
<button ivButton (click)="open()">Open dialog</button>

<ng-template #confirmTpl>
  <iv-dialog-header>
    <iv-dialog-title>Delete project?</iv-dialog-title>
    <iv-dialog-description>This action cannot be undone.</iv-dialog-description>
  </iv-dialog-header>
  <iv-dialog-footer>
    <button ivButton variant="outline" [ivDialogClose]="false">Cancel</button>
    <button ivButton variant="destructive" [ivDialogClose]="true">Delete</button>
  </iv-dialog-footer>
</ng-template>
```

```ts
private dialog = inject(IvDialog);
readonly confirmTpl = viewChild.required<TemplateRef<unknown>>('confirmTpl');

open() {
  const ref = this.dialog.open<unknown, boolean>(this.confirmTpl());
  ref.afterClosed().subscribe(({ reason, result }) => {
    if (reason === 'close-button' && result === true) this.deleteProject();
  });
}
```

## Examples

### Component with data

<!-- demo: dialog-component -->

### Form

<!-- demo: dialog-form -->

### Trigger directive

<!-- demo: dialog-trigger -->

### Sizes

<!-- demo: dialog-sizes -->

### Scrolling body

<!-- demo: dialog-scrolling-body -->

### Close reasons

<!-- demo: dialog-close-reasons -->

## API

Every part also accepts `class`.

### IvDialog

Service, `providedIn: 'root'`.

| Method | Signature | Description |
|---|---|---|
| `open` | `<T, R, D>(content: Type<T> \| TemplateRef<unknown>, config?: DialogConfig<D>) => IvDialogRef<T, R>` | Opens a dialog. |

A template gets `$implicit` (the ref), `data` and `dialogRef` in its context. A component gets `IvDialogRef` and `IV_DIALOG_DATA` by injection.

### IvDialogRef

| Member | Signature | Description |
|---|---|---|
| `close` | `(result?: R, reason?: DialogCloseReason) => void` | Closes the dialog. `reason` defaults to `'programmatic'`. Only the first close counts. |
| `afterClosed` | `() => Observable<DialogCloseEvent<R>>` | Emits once, then completes. |
| `closed` | `Signal<DialogCloseEvent<R> \| undefined>` | `undefined` while open, then the close event. |
| `componentInstance` | `T \| undefined` | The live instance when opened with a component. |

### DialogConfig

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `D` | `null` | Injected as `IV_DIALOG_DATA`. Also in the template context as `data`. |
| `size` | `'sm' \| 'default' \| 'lg' \| 'xl' \| 'fit'` | `'default'` | Panel width. `fit` sizes to content. |
| `height` | `'auto' \| 'tall'` | `'auto'` | `tall` pins the height to 34rem, or the viewport if shorter, so multi-step dialogs do not resize. Long steps scroll in the body. |
| `showCloseButton` | `boolean` | `true` | Shows the corner close button. |
| `disableBackdropClose` | `boolean` | `false` | Backdrop click does not close. |
| `disableEscapeClose` | `boolean` | `false` | Escape does not close. |
| `panelClass` | `string \| string[]` | none | Extra classes on the overlay panel. |
| `backdropClass` | `string \| string[]` | none | Extra classes on the backdrop. |
| `ariaLabel` | `string` | none | Sets `aria-label`. Alone, it drops the default label reference. |
| `ariaLabelledBy` | `string` | title id | Sets `aria-labelledby`. |
| `ariaDescribedBy` | `string` | description id | Sets `aria-describedby`. |

### DialogCloseEvent

`{ reason: DialogCloseReason; result?: R }`.

| Reason | Meaning |
|---|---|
| `'backdrop'` | Backdrop click. |
| `'escape'` | Escape key. |
| `'close-button'` | Corner close button, or an `[ivDialogClose]` element. |
| `'programmatic'` | A `close()` call with no reason. |
| `'navigation'` | The overlay was disposed from outside, for example by a route change. |

### IV_DIALOG_DATA

Injection token for the `data` passed to `open`.

### ivDialogTrigger

Opens a dialog on click.

| Name | Type | Default | Description |
|---|---|---|---|
| `ivDialogTrigger` | `Type<T> \| TemplateRef<unknown>` | required | What to open (class field `content`). |
| `ivDialogConfig` | `DialogConfig<D>` | `{}` | Config for `open`. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `opened` | `IvDialogRef<T, R>` | Fires when the dialog opens. |
| `closed` | `DialogCloseEvent<R>` | Fires when the dialog closes. |

### ivDialogClose

Closes the dialog on click. It adds no styles: put it on a styled button such as `<button ivButton>`.

| Name | Type | Default | Description |
|---|---|---|---|
| `ivDialogClose` | `R` | `undefined` | Result passed to `close` (class field `result`). |
| `reason` | `DialogCloseReason` | `'close-button'` | Reason reported on close. |

### iv-dialog-header, iv-dialog-footer

Layout parts. No inputs. The header and footer stay pinned while the body scrolls.

### iv-dialog-title

Renders an `<h2>`. No inputs.

### iv-dialog-description

| Name | Type | Default | Description |
|---|---|---|---|
| `innerHTML` | `string \| undefined` | `undefined` | HTML for the text. Angular sanitizes it. When set, projected content is ignored. |

### iv-dialog-body

Scrollable region between header and footer. No inputs.

## Accessibility

- The panel has `role="dialog"` and `aria-modal="true"`.
- It is labelled by `iv-dialog-title` and described by `iv-dialog-description`. `ariaLabel`, `ariaLabelledBy` and `ariaDescribedBy` override these.
- Focus is trapped inside the panel, and moves into it on open.
- On close, focus returns to the element that was focused before open. It is not moved if focus is already somewhere else outside the dialog. This runs before `afterClosed` emits, so a subscriber can still move focus.
- Escape closes the dialog. It is routed through the CDK keyboard dispatcher, so only the topmost overlay closes: an open select or menu inside the dialog closes first.
- The close button has the hidden label "Close".
- Body scroll is blocked while open.

## Notes

- Inside a `<form>` that wraps header, body and footer, add `class="contents"` to the form. Otherwise the form is the single flex child and the container gap collapses.
- Focus the first field with `cdkFocusInitial` if the default initial focus is wrong.

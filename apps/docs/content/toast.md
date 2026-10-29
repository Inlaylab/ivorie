---
title: Toast
description: Short messages that close on their own.
section: component
entry: '@ivorie/ui/toast'
---

Short messages at the bottom of the screen. They close after a delay.

## Usage

```ts
import { IvToastService, provideIvToast } from '@ivorie/ui/toast';

export const appConfig: ApplicationConfig = {
  providers: [provideIvToast()],
};
```

```ts
const toast = inject(IvToastService);

const id = toast.show('Saved', 'success');
toast.show('Could not save', 'destructive', { duration: 0 }); // 0 = stays until dismissed
toast.dismiss(id);
toast.dismissAll();
```

## Examples

### Variants

<!-- demo: toast-variants -->

### Persistent

<!-- demo: toast-persistent -->

## API

Every part also accepts `class`.

### IvToastService

| Method | Signature | Description |
|---|---|---|
| `show` | `(message: string, variant: ToastVariant, opts?: ToastOptions) => string` | Adds a toast. Returns its id. |
| `dismiss` | `(id: string) => void` | Removes one toast. Unknown ids are ignored. |
| `dismissAll` | `() => void` | Removes every toast. |

| Member | Type | Description |
|---|---|---|
| `toasts` | `Signal<ToastItem[]>` | Current toasts. |
| `toasts$` | `Observable<ToastItem[]>` | Same, via `toObservable`. It emits asynchronously, once per change-detection flush. |

`ToastVariant` is `'success' | 'destructive' | 'info' | 'warning'`.

`ToastOptions`:

| Name | Type | Default | Description |
|---|---|---|---|
| `duration` | `number` | by variant | Ms until auto-close. `0` stays. Defaults: success 3000, info 5000, warning 6000, destructive 10000. |
| `icon` | `string` | variant icon | Legacy names: `check_circle`, `error`, `warning`, `info`. Anything else uses the variant icon. |

`ToastItem` is `{ id, message, variant, icon?, duration }`.

### provideIvToast

Environment provider. Mounts the toast container on `document.body` in the browser. On the server it does nothing.

### iv-toast-container

Renders the toasts. No inputs.

### iv-toast

Renders one toast. Used by the container.

| Name | Type | Default | Description |
|---|---|---|---|
| `toast` | `ToastItem` | required | The toast to render. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `close` | `void` | Fires when the close button is pressed. |

## Accessibility

- The container is a `region` named "Notifications". Each toast is its own live region.
- `destructive` toasts use `role="alert"` and `aria-live="assertive"`. Others use `role="status"` and `aria-live="polite"`.
- The close button has `aria-label="Dismiss"`.

## Notes

- Use `provideIvToast()` or place `<iv-toast-container />` yourself, not both. The provider skips its own only if a container is on the page at first render. A container in a lazy route or `@defer` block would be a second one.
- `message` may hold HTML. Angular sanitizes it: scripts and event attributes are removed.

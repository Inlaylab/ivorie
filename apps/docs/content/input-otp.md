---
title: Input OTP
description: A one-time code input split into slots, with paste support.
section: component
entry: '@inlaylab/ivorie/input-otp'
---

One hidden input holds the value. The slots only show it, so typing, paste and autofill work like a normal input.

## Usage

```ts
import { IV_INPUT_OTP_IMPORTS } from '@inlaylab/ivorie/input-otp';
```

```html
<iv-input-otp maxLength="4" aria-label="Code" [(ngModel)]="code">
  <iv-input-otp-group>
    <iv-input-otp-slot index="0" />
    <iv-input-otp-slot index="1" />
    <iv-input-otp-slot index="2" />
    <iv-input-otp-slot index="3" />
  </iv-input-otp-group>
</iv-input-otp>
```

## Examples

### Pattern

`pattern` is a regex source. Input that does not match is dropped. `REGEXP_ONLY_DIGITS` and `REGEXP_ONLY_DIGITS_AND_CHARS` are exported.

<!-- demo: input-otp-pattern -->

### Reactive forms

<!-- demo: input-otp-reactive-forms -->

## API

Every part also accepts `class`.

### iv-input-otp

| Name | Type | Default | Description |
|---|---|---|---|
| `maxLength` | `number` | required | Number of characters. |
| `pattern` | `string \| null` | `null` | Regex source each value must match. |
| `value` | `string` | `''` | Value, when not used with forms. |
| `disabled` | `boolean` | `false` | Disables the input. Form-disabled works too. |
| `id` | `string \| null` | `null` | Id of the hidden input, for a `<label for>`. |
| `aria-label` / `aria-labelledby` | `string \| null` | `null` | Label for the input. |

Outputs: `valueChange` (`string`), `complete` (`string`, once every slot is filled).

Works with `ngModel` and reactive forms.

### iv-input-otp-slot

| Name | Type | Default | Description |
|---|---|---|---|
| `index` | `number` | required | Which character the slot shows. |

### Other parts

- `iv-input-otp-group`, `iv-input-otp-separator`.

## Accessibility

The real input carries the label and value, so screen readers read it as one text field.

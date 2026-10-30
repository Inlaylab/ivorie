---
title: Field
description: Form layout parts that group a label, control, description and error.
section: component
entry: '@inlaylab/ivorie/field'
---

Layout only. It does not manage form state.

## Usage

```ts
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
```

```html
<iv-field>
  <label ivLabel for="email">Email</label>
  <input ivInput id="email" />
  <p ivFieldDescription>We never share this address.</p>
</iv-field>
```

## Examples

### Horizontal

<!-- demo: field-horizontal -->

### Error

<!-- demo: field-error -->

### Fieldset

<!-- demo: field-fieldset -->

### Separator

<!-- demo: field-separator -->

## API

Every part also accepts `class`.

### iv-field

| Name | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'vertical' \| 'horizontal' \| 'responsive'` | `'vertical'` | Stack direction. `responsive` is a column that becomes a row at the `@md/field-group` container-query breakpoint. |
| `invalid` | `boolean` | `false` | Sets `data-invalid="true"` for error styling. |

### iv-field-legend, legend[ivFieldLegend]

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'legend' \| 'label'` | `'legend'` | Heading or label size. |

### iv-field-error

| Name | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | `''` | Error text. Projected content is also shown. |

### Other parts

No inputs besides `class`: `iv-field-set` (or `fieldset[ivFieldSet]`), `iv-field-group`, `iv-field-content`, `iv-field-title`, `iv-field-description` (or `p[ivFieldDescription]`), `iv-field-separator`.

## Accessibility

`iv-field` has `role="group"`. `iv-field-error` has `role="alert"`, so errors are announced when they appear. It renders nothing, and takes no space, when it has no `message` and no content. Use `fieldset` and `legend` to group related controls.

## Notes

`iv-field-group` is the container-query root for `responsive` fields.

---
title: Forms
description: Use Ivorie inputs with template-driven and reactive forms, labels and errors.
section: guide
order: 5
---

Ivorie form controls are Angular form controls. Bind them with `ngModel` or with reactive forms, the same way as a native input.

## Template-driven

Bind a value with `[(ngModel)]`. Import `FormsModule`.

<!-- demo: checkbox-ngmodel -->

## Reactive forms

Bind a control with `[formControl]` or `formControlName`. Validators, `disabled` and `touched` work as usual. Import `ReactiveFormsModule`.

<!-- demo: select-reactive-forms -->

The same works for every control:

- [Checkbox](docs/checkbox), [Switch](docs/switch) and [Radio Group](docs/radio-group)
- [Select](docs/select) and [Combobox](docs/combobox)
- [Input](docs/input), [Slider](docs/slider) and [Input OTP](docs/input-otp)

<!-- demo: switch-reactive-forms -->

## Labels, help and errors

Wrap a control in a field. The field links the label, the description and the error to the control, so screen readers read them together.

<!-- demo: field-error -->

See [Field](docs/field) for horizontal fields, fieldsets and separators.

## Forms in a dialog

A form in a dialog submits like any other form. The dialog closes when your code closes it, for example after a valid submit.

<!-- demo: dialog-form -->

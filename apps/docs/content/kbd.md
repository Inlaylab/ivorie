---
title: Kbd
description: Shows a keyboard key or shortcut.
section: component
entry: '@inlaylab/ivorie/kbd'
---

## Usage

```ts
import { IV_KBD_IMPORTS } from '@inlaylab/ivorie/kbd';
```

```html
<kbd ivKbdGroup><kbd ivKbd>Ctrl</kbd><kbd ivKbd>K</kbd></kbd>
```

## Examples

### In a button

<!-- demo: kbd-button -->

## API

Every part also accepts `class`.

### kbd[ivKbd]

One key. No inputs.

### kbd[ivKbdGroup]

Groups keys with a small gap. No inputs.

## Accessibility

Uses the native `kbd` element. Screen readers read the text, so write `Ctrl`, not only a symbol, where it matters.

---
title: Accessibility
description: How Ivorie components handle roles, keyboard, focus and motion.
section: guide
order: 7
---

Each component follows its WAI-ARIA pattern. The roles, states and keys are listed on its page, under **Accessibility**.

## What every component does

- **Roles and states.** Native elements where they exist (`button`, `input`), ARIA roles where they do not, with `aria-expanded`, `aria-selected` and `aria-checked` kept up to date.
- **Keyboard.** Everything works without a mouse. Arrow keys move inside lists and menus, `Escape` closes the topmost overlay, `Tab` leaves the widget.
- **Focus.** Dialogs and sheets trap focus and return it on close. Focus rings show for keyboard users.
- **Tests.** Component tests run axe, so common problems fail the build.

## Keys by family

| Family | Keys |
|---|---|
| Menus, select, combobox | `ArrowUp`, `ArrowDown`, `Home`, `End`, typeahead, `Enter`, `Escape` |
| Tabs, radio group, toggle group | Arrow keys move and select, `Home`, `End` |
| Dialog, sheet, drawer | `Escape` closes, `Tab` stays inside |
| Slider | Arrow keys, `PageUp`, `PageDown`, `Home`, `End` |
| Charts | One tab stop; arrow keys move between points, `Escape` hides the tooltip |

## Your part

- **Name icon-only buttons.** Add `aria-label`.
- **Label every field.** Use a `label` or a [field](docs/field).
- **Keep contrast** when you change colors. Text needs 4.5:1 on its background.
- **Reduced motion.** Themes take a motion dial: `off` stops animations. See [Theming](docs/theming).

---
"@inlaylab/ivorie": minor
"ivorie": minor
---

17 new components: aspect-ratio, empty, kbd, native-select, toggle, toggle-group, slider, popover, sheet, context-menu, menubar, navigation-menu, command, input-otp, resizable, drawer, carousel.

Fixes: avatar resets on a new `src`; `data-variant` / `data-size` survive `null`; select marks touched on blur; combobox uses the list's `id` as the only listbox id (the input's `listboxId` input is removed) and clears its text when the parent resets the value; tooltip and hover card add no document listeners; truncate tooltip sets its real `data-side`; accordion animates open and close; tabs ids no longer collide; select picker does not save into a disabled control. Dialog close reason `'drag'` (drawer).

Faster dev reloads: components draw their icons with the new `IvIcon` (`@inlaylab/ivorie/icon`, Lucide shapes) instead of `@lucide/angular`, which dev servers load whole (~14 MB). `@lucide/angular` is no longer a peer dependency, and `ivorie init` no longer installs it. `IvIcon` also draws any icon from the plain `lucide` package: `<svg [ivIcon]="House">`.

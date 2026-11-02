# @inlaylab/ivorie

## 1.2.0

### Minor Changes

- cfc5b54: Presets for the whole look. 7 base colors (neutral, stone, zinc, mauve, olive, mist, taupe), 26 fonts, a heading font and 5 radius options. `ivorie init` applies font, heading font and radius (new flags `--font`, `--font-heading`, `--radius`). New command `ivorie apply <preset|ivp1_…>` changes the look of an existing app. Card, dialog and alert dialog titles use the heading font (`.cn-font-heading`, `--font-heading`). Make a preset in the new docs playground.

### Patch Changes

- adae7b5: Every radius token now follows `--radius`, as in shadcn/ui: `--radius-sm` to `--radius-4xl` are 0.6x to 2.6x of it. Before, `rounded-2xl`, `rounded-3xl` and `rounded-4xl` (used by the luma, maia and rhea styles) kept Tailwind's fixed sizes, so a smaller radius, even `none`, still left those corners round. At the default radius, `sm`, `md`, `lg` and `xl` are unchanged; `2xl` to `4xl` move to shadcn's current values.
- 508a4f7: Sidebar: the mobile drawer works when `iv-sidebar` sits inside a layout element of the provider (for example a row next to `ivSidebarInset`). Before, that element was made inert with the rest of the page, so the drawer's links could not be clicked.
- cfc5b54: Select, dropdown menu and combobox panels are solid again. The styles had copied shadcn's opt-in translucent menu rule, so long lists showed the page through when scrolled.

## 1.1.0

### Minor Changes

- 2e9daa1: 17 new components: aspect-ratio, empty, kbd, native-select, toggle, toggle-group, slider, popover, sheet, context-menu, menubar, navigation-menu, command, input-otp, resizable, drawer, carousel.

  Fixes: avatar resets on a new `src`; `data-variant` / `data-size` survive `null`; select marks touched on blur; combobox uses the list's `id` as the only listbox id (the input's `listboxId` input is removed) and clears its text when the parent resets the value; tooltip and hover card add no document listeners; truncate tooltip sets its real `data-side`; accordion animates open and close; tabs ids no longer collide; select picker does not save into a disabled control. Dialog close reason `'drag'` (drawer).

  Faster dev reloads: components draw their icons with the new `IvIcon` (`@inlaylab/ivorie/icon`, Lucide shapes) instead of `@lucide/angular`, which dev servers load whole (~14 MB). `@lucide/angular` is no longer a peer dependency, and `ivorie init` no longer installs it. `IvIcon` also draws any icon from the plain `lucide` package: `<svg [ivIcon]="House">`.

# @inlaylab/ivorie

## 1.5.0

### Minor Changes

- Charts (`@inlaylab/ivorie/chart`): line, area, bar, pie and donut, radar and radial charts, with tooltip, legend and keyboard support. Four dashboard blocks.
- Accent colors (17, from shadcn) with colored charts: preset fields and CLI flags `theme`, `chartColor`, `menuAccent`. New styles lyra, mira and sera; aurora and brutal removed. Glass reworked as neutral glass with edges drawn with light.

## 1.4.1

### Patch Changes

- Radius and font follow the pick in every style. The radius scale (`--radius-sm` to `--radius-4xl`) is now re-declared on every `style-*` element, so a `--radius` set below `:root` (a preview, a style class) reaches every component. Mono no longer forces radius 0 and the mono font: like every style it takes `--radius`, `--font-sans` and `--font-heading` from the theme. To keep the old Mono look, pick a mono font and radius none.

## 1.4.0

### Minor Changes

- c638813: Blocks: 19 ready-made login, sign-up, sidebar and dashboard pages, wired with reactive forms and typed outputs. Add one with `ivorie add login-01`; imports and icons follow your app. The sidebar gains `a[ivSidebarMenuButton]` and `button[ivSidebarMenuButton]` for router links and menu triggers.
- 7d4ac1f: New data table: sort, pagination, filter, row selection and column visibility. Use one feature or all, in the browser or on your server.
- 15bb87e: Five new styles: glass, brutal, aurora, bento and mono. `ivorie init --style glass` and `ivorie apply` accept them. The playground previews each look in an isolated frame, with a desktop, tablet and mobile width toggle.

## 1.3.0

### Minor Changes

- 513aca1: Icon libraries. Components draw Lucide by default; `provideIvIcons(COMPONENT_ICONS)` from `@inlaylab/ivorie/icons/{tabler,phosphor,hugeicons,remix}` switches them. The CLI preset gains `iconLibrary` (`init --icon-library`, `apply`), and `ivorie migrate icons --from <lib> --to <lib>` renames your own `@ng-icons` icons.

  The default style is now nova (was maia). `npx ivorie init` with no preset and `apply default` give nova. Old share codes keep their style.

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

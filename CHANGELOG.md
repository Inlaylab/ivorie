# Changelog

## 1.4.1

Both packages: `@inlaylab/ivorie` and `ivorie` 1.4.1. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- Radius follows the pick in every style. The radius scale (`--radius-sm` to `--radius-4xl`) is re-declared on every `style-*` element, so small buttons, inputs, calendar cells and Rhea cards follow a `--radius` set below `:root`.
- Mono takes font and radius from the theme like every style. It no longer forces radius 0 and the mono font. To keep the old look, pick a mono font and radius none. The playground picks Geist Mono when you switch to Mono.

## 1.4.0

Both packages: `@inlaylab/ivorie` and `ivorie` 1.4.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- Five new styles: glass, brutal, aurora, bento and mono, next to shadcn's five. Glass turns solid without `backdrop-filter` or with reduced transparency. Every style is tested for compile and text contrast, light and dark.
- Data table (`@inlaylab/ivorie/data-table`): sort, pagination, filter, row selection and column visibility as five standalone features. Use one or all, in the browser or on your server (`manual`, `query()`). Parts: sort header, pagination, view options, row checkboxes, loading and empty rows.
- Blocks: 19 ready-made pages (login-01…05, signup-01…05, sidebar-01…08, dashboard-01), wired with reactive forms and typed outputs. `ivorie add login-01` writes them to `src/app/blocks/`, rewrites imports and renames icons to your library.
- Sidebar: `a[ivSidebarMenuButton]` and `button[ivSidebarMenuButton]` for router links and menu triggers.
- Docs: `/blocks` with live previews and code, a style gallery in the playground with an isolated preview frame and width toggle, a live install command on the home page.

## 1.3.0

Both packages: `@inlaylab/ivorie` and `ivorie` 1.3.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- Icon libraries: Lucide, Tabler, Phosphor, Hugeicons or Remix. Components draw Lucide by default; `provideIvIcons(COMPONENT_ICONS)` from `@inlaylab/ivorie/icons/<lib>` switches them.
- CLI: the preset gains `iconLibrary` (`init --icon-library`, `apply`). New `ivorie migrate icons --from <lib> --to <lib>` renames your own `@ng-icons` icons (185 shared icons).
- Default style is now nova (was maia). Old share codes keep their style.
- Docs: the playground picks the icon library and shows icons in every scene; look options are dropdowns.

## 1.2.0

Both packages: `@inlaylab/ivorie` and `ivorie` 1.2.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- Presets for the whole look: 7 base colors, 26 fonts, a heading font and 5 radius options. Share code `ivp1_…`; 1.1 codes still work.
- CLI: `ivorie init` applies font, heading font and radius (`--font`, `--font-heading`, `--radius`). New `ivorie apply <preset|ivp1_…>` changes the look of an existing app.
- Library: card, dialog and alert dialog titles use the heading font (`.cn-font-heading`, `--font-heading`). Every radius token follows `--radius` (`sm` to `4xl`), so a preset radius reaches every style.
- Fixes: menus are solid (no see-through panels on long lists); the sidebar's mobile drawer works when the sidebar is nested in a layout element.
- Docs: new playground at `/playground` (pick a look, copy one command), new home page, floating header with one light/dark button, docs sidebar with a filter.

## 1.1.0

Both packages: `@inlaylab/ivorie` and `ivorie` 1.1.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- 17 new components: aspect-ratio, empty, kbd, native-select, toggle, toggle-group, slider, popover, sheet, context-menu, menubar, navigation-menu, command, input-otp, resizable, drawer, carousel.
- Faster dev reloads: components draw their icons with the new `IvIcon` (`@inlaylab/ivorie/icon`). `@lucide/angular` (one 10 MB file that `ng serve` loads whole) is no longer a peer dependency. `IvIcon` also draws any icon from the plain `lucide` package.
- Breaking (small): `iv-combobox-input` has no `listboxId` input. Set `id` on `iv-combobox-list` instead.
- Fixes: avatar, null variant/size data attributes, select touched on blur, combobox reset, tooltip and hover card listeners, truncate tooltip side, accordion animation, tabs ids, select picker save on a disabled control.
- Docs: components index at `/docs/components`; every example shows preview and code together.
- Release: Changesets (one version for both packages); npm Trusted Publishing.

## 1.0.0

First release of `@inlaylab/ivorie` and the `ivorie` CLI.

- 34 Angular components, one entry point each (`@inlaylab/ivorie/button`).
- Signals API. Works in standalone, NgModule, SSR and zoneless apps. Angular 22, Tailwind 4.
- shadcn/ui styles: vega, nova, maia, luma, rhea.
- `ivorie` CLI: `init`, `add`, `migrate`.

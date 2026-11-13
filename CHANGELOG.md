# Changelog

## 1.5.0

Both packages: `@inlaylab/ivorie` and `ivorie` 1.5.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- Charts (`@inlaylab/ivorie/chart`): line, area, bar, pie and donut, radar and radial. You build a chart from small parts, the way shadcn does: `iv-chart` with a series config, then axes, grid, series, labels, tooltip and legend. Colors come from `--chart-1…5` through `--color-<key>`, so themes and dark mode just work. Charts render as SVG on the server. They work with mouse, touch and keyboard (one tab stop, arrow keys, Escape). Built on `d3-scale` and `d3-shape`; the entry with d3 is about 41 kB gzipped.
- Docs: a chart page with a step-by-step first chart, and a gallery of 70 examples (area, bar, line, pie, radar, radial, tooltip) ported from shadcn.
- Blocks: `dashboard-01` gets its interactive area chart (90, 30 or 7 days). New `dashboard-02` (analytics), `dashboard-03` (sales) and `dashboard-04` (product usage). 22 blocks in total.
- Every own style (glass, bento, mono) restyles the chart tooltip like its menus.
- Accent colors: shadcn's 17 accents (red … rose) over any base color. They set `--primary`, `--secondary`, `--sidebar-primary` and the chart colors, so dashboards are no longer gray. New preset fields `theme`, `chartColor` (follow the accent, gray, or another accent) and `menuAccent` (`subtle` or `bold`). CLI flags `--theme`, `--chart-color`, `--menu-accent`; `components.json` keeps them. Old `ivp1_` codes still work. Playground: Accent, Chart color and Menu accent dials. Home: an accent row over the wall.
- Styles: shadcn's lyra (boxy and sharp), mira (compact) and sera (editorial) are synced. Aurora and brutal are removed: their fixed hues, ink borders and offset shadows did not follow the base color, the accent or the radius scale. 11 styles in total.
- **Upgrade note (aurora, brutal):** `@inlaylab/ivorie/styles/style-aurora.css` and `style-brutal.css` are gone, and `ivorie init --style aurora|brutal` now fails. Apps that copied the style with the CLI keep their copy and keep working. Package users: import another style and change the `style-*` class on `<body>` (glass, lyra or vega are the closest), or run `npx ivorie apply <preset>`.
- Glass reworked, with ideas from [solid-glass](https://github.com/deeplethe/solid-glass) (MIT): neutral panes with no border, edges drawn with light (rim, hairline, contact and drop shadow), thickness by depth (control, card, floating pane), and a faint light made from `--primary` instead of a fixed violet/cyan/pink field. Dark is an even, unlit page. Solid fallbacks stay.
- Style sync drops rules that shadcn commented out (sera).
- Registry: a block now lists the npm packages of every component it uses, so `chart` blocks list `d3-scale` and `d3-shape`. Existing blocks' JSON gains the same transitive packages (for example `clsx`); the CLI already installed them.
- CLI: `ivorie add chart` (or a block that uses it) also installs `@types/d3-scale` and `@types/d3-shape` as dev dependencies, so copied charts compile in a strict app. Registry items list them under `devDependencies`.
- Apps set up with `ivorie init` on 1.4 or earlier have their own copy of `theme.css` without the `chart-*` keyframes. Charts work, but without the entrance animation until you re-run `ivorie init` (or `ivorie apply` with your preset), or copy the `--animate-chart-*` tokens and `chart-*` keyframes from the new `theme.css`.

## 1.4.1

Both packages: `@inlaylab/ivorie` and `ivorie` 1.4.1. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- Radius follows the pick in every style. The radius scale (`--radius-sm` to `--radius-4xl`) is re-declared on every `style-*` element, so small buttons, inputs, calendar cells and Rhea cards follow a `--radius` set below `:root`.
- Mono takes font and radius from the theme like every style. It no longer forces radius 0 and the mono font. To keep the old look, pick a mono font and radius none. The playground picks Geist Mono when you switch to Mono.
- Docs redesign (smoky glass, dark-first). Home: a wall of live components with an inline style switcher. Playground: one compact panel, the wall as the only preview, Copy link, Shuffle and Get code. Blocks: category tabs and full-width previews with a toolbar. The site look never reaches the previews.

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

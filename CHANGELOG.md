# Changelog

One entry per release: a `## X.Y.Z — YYYY-MM-DD` heading, a one-line title, then the notes. The docs changelog page parses this file, so keep that heading format.

## 1.6.0 — 2026-11-26

Themes and dials, rich parts, data blocks, a new site.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.6.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### New

- Themes Slate, Midnight and Clay. 11 themes in total: 7 of Ivorie's own and shadcn/ui's nova, luma, mira and sera.
- Dials: density, contrast and motion for every theme; panels, rim, shadow, blur and ambient where the theme takes them. `components.json` keeps the dials you set (`preset`), so `ivorie apply <theme>` keeps them.
- Rich parts: `iv-meter`, `iv-gauge`, `iv-stat`, `iv-delta`, `iv-tracker`, `iv-bar-list` and `svg[ivSparkline]`. Every theme styles them.
- Blocks: `stats-01`, `usage-01` and `status-01`. 25 blocks in total.
- Docs guides: Introduction, Forms, Server rendering and Accessibility. A changelog page replaces the roadmap page (`/roadmap` redirects).

### Changed

- One concept: theme. `styles/theme-<name>.css`, `class="theme-<name>"`, `ivorie init --theme <name|code>` and `--accent <color>`; `components.json` uses `theme` and `accent`. The 1.5 names (`style-<name>.css`, `.style-<name>`, `--preset`, `--style`, `--theme <accent>`) keep working until 2.0. Old `ivp1_` codes are unchanged.
- Graphite is renamed Slate. `graphite` keeps working until 2.0: its files, class, CLI name and share codes all give slate. New package files: `@inlaylab/ivorie/styles/theme-slate.css` and `style-slate.css`.
- `ivorie init` starts on Slate (zinc with the blue accent, Geist, small radius), not nova. Glass keeps violet as its own default.
- The docs site runs on the default theme, with no glow or blur, and follows your OS light or dark setting.
- Upgrading a 1.5 app: run `npx ivorie apply <theme>` once. It moves files, classes and `components.json` to the new names and adds the theme rules the rich parts need.

### Improvements

- `ivorie init` and `apply` change only Ivorie's own theme classes and imports. Your `theme-dark` class and `theme-overrides.css` import stay.
- `ivorie add` warns when your theme file predates the rich parts, so they never render without colors.
- High contrast also darkens muted text in Ivorie's own themes.
- Density sets `--spacing` on `:root`, so it scales all of your app's Tailwind spacing; the default theme leaves it at `default`.
- Toasts pause while hovered or focused, so an action like Undo stays reachable.
- Playground: Copy init command comes first, theme tiles show real parts, and copied commands pin `npx ivorie@1.6`. The wall leads with Overview, Status, Usage and Top pages cards.

### Fixes

- The switch scales with density (on compact themes the checked thumb fell short of the track end).
- Vertical tabs in Glass no longer turn into an ellipse.
- Calendar day colors come from CSS variables, so themes recolor them.
- The data-table footer wraps on a phone and keeps the page-size select.
- A select with a leading icon or color chip keeps its value next to it instead of centering it.
- Grouped buttons in Glass and Bento have matching ends.

## 1.5.2 — 2026-11-17

Clearer buttons and fields, branded blocks.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.5.2. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### Improvements

- Glass, graphite and bento: outline and secondary buttons no longer look the same. Outline has a visible border and no shadow; secondary is a soft tint of `--primary` with primary text and no ring.
- Glass: field borders (input, textarea, input group, select, OTP) are stronger, through a new `--glass-field-line` token.
- Blocks: dashboard-01 to 04 show the Ivorie mark and name in the sidebar, and the demo user in dashboard-01 to 04, sidebar-07 and sidebar-08 is Ivorie.
- Docs home: the hero reads "13 styles. One codebase. Built for Angular." A same-code chip sits under the style picker, the facts sit in one row with icons, and the wall is wider with no clipped card edges.
- Docs: a neutral site glow and a dotted canvas behind the home wall and the playground; the glass corner light is off inside these windows. Active toggles on home, blocks and the playground use the primary color. Each style opens in its own hue: tint in fuchsia, mono in amber, lyra in yellow, mira in emerald.
- Docs: demos for radio group, switch, toggle, toggle group and tabs have labels and short descriptions. Chart demos use the theme's chart colors. The sidebar demos' Projects group hides in icon mode.

### Fixes

- Glass, graphite, bento, mono and tint: the input inside an input group stays transparent, so it no longer covers the group's border (combobox).
- Command: the search icon has spacing from the input.

## 1.5.1 — 2026-11-16

Graphite and Tint, icon and preview fixes.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.5.1. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### New

- Styles Graphite (matte solid panes, a line of light on the top edge, pressed-in fields) and Tint (page, panes, lines and states take a wash of `--primary`, so the accent colors the whole UI). 13 styles in total. Import `@inlaylab/ivorie/styles/style-graphite.css` or `style-tint.css` and set `style-graphite` or `style-tint` on `<body>`, or pass `--style graphite|tint` to the CLI.
- Docs: launch post drafts in `docs/LAUNCH.md`.

### Changed

- Docs: glass is the site's style and the first in every style list. The playground and block previews start on glass. `ivorie init` still defaults to nova.
- Docs: each style opens in a palette that suits it (glass violet, nova indigo, maia orange, sera red, bento green, mono emerald, graphite grey, and more). A color you picked stays when you switch style. Style lists put Ivorie's own five first (glass, graphite, tint, mono, bento), then shadcn's eight.

### Improvements

- Mono reads more like a terminal: inverted text selection, spaced capital labels (table heads, sidebar and menu labels), a cursor bar on the active sidebar item, outlined keys.
- Glass primary buttons and checks are solid, not glossy.
- Docs: the playground shows `npx ivorie init` alone only for the CLI default look. The style list shows one line icon per style. The home wall drops its accent row and switches style with a short fade, its sheets preloaded. The home footer credits shadcn/ui and Radix UI. Component demos show the site's look (neutral base, violet accent), like the home wall.

### Fixes

- Sidebar collapsed to icons: menu buttons no longer shrink their children. `<ng-icon>` hosts have `overflow: hidden`, so they could shrink to 0 px wide; icons, team logos and avatars now keep their size (sidebar-07, dashboard-01, dashboard-03).
- `<ng-icon>` icons no longer shrink in a tight row: buttons, menu items, select and combobox items, tabs, toggles and sidebar parts hold `ng-icon` as they hold `svg`.
- Glass, bento, graphite and tint: destructive text (badge, button) is mixed toward the foreground, so it keeps 4.5:1 on their toned surfaces.
- Docs: component page demos are styled again. The site's nova skipped every `.docs-preview`, demo cards included; now it skips only previews that name another style.
- Docs: README counts and the install line are correct.

## 1.5.0 — 2026-11-13

Charts and dashboard blocks.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.5.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### New

- Charts (`@inlaylab/ivorie/chart`): line, area, bar, pie and donut, radar and radial. Build a chart from small parts, the way shadcn does: `iv-chart` with a series config, then axes, grid, series, labels, tooltip and legend. Colors come from `--chart-1…5` through `--color-<key>`, so themes and dark mode just work. Charts render as SVG on the server and work with mouse, touch and keyboard (one tab stop, arrow keys, Escape). Built on `d3-scale` and `d3-shape`; the entry with d3 is about 41 kB gzipped.
- Docs: a chart page with a step-by-step first chart, and a gallery of 70 examples (area, bar, line, pie, radar, radial, tooltip) ported from shadcn.
- Blocks: `dashboard-01` gets its interactive area chart (90, 30 or 7 days). New `dashboard-02` (analytics), `dashboard-03` (sales) and `dashboard-04` (product usage). 22 blocks in total.
- Accent colors: shadcn's 17 accents (red … rose) over any base color. They set `--primary`, `--secondary`, `--sidebar-primary` and the chart colors. New preset fields `theme`, `chartColor` (follow the accent, gray, or another accent) and `menuAccent` (`subtle` or `bold`). CLI flags `--theme`, `--chart-color`, `--menu-accent`; `components.json` keeps them. Old `ivp1_` codes still work. Playground: Accent, Chart color and Menu accent dials.
- Styles: shadcn's lyra (boxy and sharp), mira (compact) and sera (editorial). 11 styles in total.

### Changed

- Aurora and brutal are removed: their fixed hues, ink borders and offset shadows did not follow the base color, the accent or the radius scale. `style-aurora.css` and `style-brutal.css` are gone, and `ivorie init --style aurora|brutal` now fails. Apps that copied the style with the CLI keep their copy. Package users: import another style and change the `style-*` class on `<body>` (glass, lyra or vega are the closest), or run `npx ivorie apply <preset>`.
- Glass reworked, with ideas from [solid-glass](https://github.com/deeplethe/solid-glass) (MIT): neutral panes with no border, edges drawn with light (rim, hairline, contact and drop shadow), thickness by depth, and a faint light made from `--primary` instead of a fixed violet/cyan/pink field. Dark is an even, unlit page. Solid fallbacks stay.
- Registry: a block lists the npm packages of every component it uses, so `chart` blocks list `d3-scale` and `d3-shape`. Existing blocks' JSON gains the same transitive packages (for example `clsx`); the CLI already installed them.
- Apps set up with `ivorie init` on 1.4 or earlier have their own `theme.css` without the `chart-*` keyframes. Charts work, but without the entrance animation until you re-run `ivorie init` or `ivorie apply`, or copy the `--animate-chart-*` tokens and `chart-*` keyframes from the new `theme.css`.

### Improvements

- Every own style (glass, bento, mono) restyles the chart tooltip like its menus.
- CLI: `ivorie add chart` (or a block that uses it) also installs `@types/d3-scale` and `@types/d3-shape` as dev dependencies, so copied charts compile in a strict app.
- Home: an accent row over the wall.

### Fixes

- Style sync drops rules that shadcn commented out (sera).

## 1.4.1 — 2026-11-09

Radius and font follow your pick.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.4.1. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### Changed

- Mono takes font and radius from the theme like every style. It no longer forces radius 0 and the mono font. To keep the old look, pick a mono font and radius none. The playground picks Geist Mono when you switch to Mono.

### Improvements

- Docs redesign (smoky glass, dark-first). Home: a wall of live components with an inline style switcher. Playground: one compact panel, the wall as the only preview, Copy link, Shuffle and Get code. Blocks: category tabs and full-width previews with a toolbar. The site look never reaches the previews.

### Fixes

- Radius follows the pick in every style. The radius scale (`--radius-sm` to `--radius-4xl`) is re-declared on every `style-*` element, so small buttons, inputs, calendar cells and Rhea cards follow a `--radius` set below `:root`.

## 1.4.0 — 2026-11-05

Own styles, data table and blocks.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.4.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### New

- Five styles: glass, brutal, aurora, bento and mono, next to shadcn's five. Glass turns solid without `backdrop-filter` or with reduced transparency. Every style is tested for compile and text contrast, light and dark.
- Data table (`@inlaylab/ivorie/data-table`): sort, pagination, filter, row selection and column visibility as five standalone features. Use one or all, in the browser or on your server (`manual`, `query()`). Parts: sort header, pagination, view options, row checkboxes, loading and empty rows.
- Blocks: 19 ready-made pages (login-01…05, signup-01…05, sidebar-01…08, dashboard-01), wired with reactive forms and typed outputs. `ivorie add login-01` writes them to `src/app/blocks/`, rewrites imports and renames icons to your library.
- Sidebar: `a[ivSidebarMenuButton]` and `button[ivSidebarMenuButton]` for router links and menu triggers.
- Docs: `/blocks` with live previews and code, a style gallery in the playground with an isolated preview frame and width toggle, a live install command on the home page.

## 1.3.0 — 2026-11-04

Icon libraries.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.3.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### New

- Icon libraries: Lucide, Tabler, Phosphor, Hugeicons or Remix. Components draw Lucide by default; `provideIvIcons(COMPONENT_ICONS)` from `@inlaylab/ivorie/icons/<lib>` switches them.
- CLI: the preset gains `iconLibrary` (`init --icon-library`, `apply`). New `ivorie migrate icons --from <lib> --to <lib>` renames your own `@ng-icons` icons (185 shared icons).

### Changed

- The default style is nova (was maia). Old share codes keep their style.

### Improvements

- Docs: the playground picks the icon library and shows icons in every scene; look options are dropdowns.

## 1.2.0 — 2026-11-02

Presets and the playground.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.2.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### New

- Presets for the whole look: 7 base colors, 26 fonts, a heading font and 5 radius options. Share code `ivp1_…`; 1.1 codes still work.
- CLI: `ivorie init` applies font, heading font and radius (`--font`, `--font-heading`, `--radius`). New `ivorie apply <preset|ivp1_…>` changes the look of an existing app.
- Docs: a playground at `/playground` (pick a look, copy one command), a new home page, a floating header with one light/dark button, a docs sidebar with a filter.

### Improvements

- Card, dialog and alert dialog titles use the heading font (`.cn-font-heading`, `--font-heading`). Every radius token follows `--radius` (`sm` to `4xl`), so a preset radius reaches every style.

### Fixes

- Menus are solid: no see-through panels on long lists.
- The sidebar's mobile drawer works when the sidebar is nested in a layout element.

## 1.1.0 — 2026-11-02

17 new components.

Both packages: `@inlaylab/ivorie` and `ivorie` 1.1.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

### New

- 17 components: aspect-ratio, empty, kbd, native-select, toggle, toggle-group, slider, popover, sheet, context-menu, menubar, navigation-menu, command, input-otp, resizable, drawer, carousel.
- `IvIcon` (`@inlaylab/ivorie/icon`): components draw their icons with it, and it also draws any icon from the plain `lucide` package.
- Docs: a components index at `/docs/components`; every example shows preview and code together.
- Release: Changesets (one version for both packages) and npm Trusted Publishing.

### Changed

- `@lucide/angular` is no longer a peer dependency. It is one 10 MB file that `ng serve` loads whole, so dev reloads are faster without it.
- Breaking (small): `iv-combobox-input` has no `listboxId` input. Set `id` on `iv-combobox-list` instead.

### Fixes

- Avatar, null variant and size data attributes, select touched on blur, combobox reset, tooltip and hover card listeners, truncate tooltip side, accordion animation, tabs ids, select picker save on a disabled control.

## 1.0.0 — 2026-10-29

First release of `@inlaylab/ivorie` and the `ivorie` CLI.

### New

- 34 Angular components, one entry point each (`@inlaylab/ivorie/button`).
- Signals API. Works in standalone, NgModule, SSR and zoneless apps. Angular 22, Tailwind 4.
- shadcn/ui styles: vega, nova, maia, luma, rhea.
- `ivorie` CLI: `init`, `add`, `migrate`.

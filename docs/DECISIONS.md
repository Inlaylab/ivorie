# Decisions

The rules this project follows and why. Each rule states what is true now. When a rule changes, edit it in place; git history keeps the old version.

To add one: put it under its topic as `Rule. Why. (since YYYY-MM-DD)`.

## Product

- Ship two ways from one source: the npm package `@inlaylab/ivorie` and the copy-in CLI `ivorie`. Users choose. (since 2026-10-23)
- The org Inlaylab owns the project (npm scope, repo `github.com/Inlaylab/ivorie`). The brand and the `iv` prefix are Ivorie. (since 2026-10-30)
- Look and behavior follow shadcn/ui (`github.com/shadcn-ui/ui`), read from a local sparse clone in `.ref/shadcn`. Keyboard and ARIA follow Radix. Where we differ, a rule here says so. (since 2026-10-23)
- New own themes are original, picked from what users ask for, never ports of another project's theme. (since 2026-11-16)

## Versions

- Build for the latest only: Angular 22 (`>=22.0.0 <23.0.0`), Tailwind `^4.0.0` (dev on 4.3), Vitest, zoneless. Raise the range per Angular major once CI is green. Details: [COMPAT.md](COMPAT.md). (since 2026-10-23)
- Angular 22 is the minimum. Code, CLI (`MIN_ANGULAR`, cdk pin) and tests assume it. Support for 21 and 20 is parked. (since 2026-11-06)
- Signals API only (`input()`, `model()`, `output()`), so there is no breaking change later. (since 2026-10-23)
- No `@angular/animations`: it is deprecated. Animations are CSS from `tw-animate-css`. (since 2026-10-23)
- Node 24 runs `tools/*.ts` directly with type stripping. No `tsx` or `ts-node`. (since 2026-10-23)

## Naming

- Selector `iv-x` or `[ivX]`, class `IvX` with no `Component`/`Directive` suffix, per the Angular style guide. (since 2026-10-23)
- Services keep a suffix only when the bare name clashes: `IvDialog`, `IvAlertDialog`, but `IvSidebarService`, `IvToastService`. (since 2026-10-23)
- Import arrays end in `_IMPORTS` (`IV_CARD_IMPORTS`); injection tokens do not (`IV_DIALOG_DATA`). (since 2026-10-23)
- Files drop `ui-`, `.component` and `.directive` (`button/button.ts`); `.service`, `.model` and `.spec` stay. (since 2026-10-23)
- `IV_*_IMPORTS` stay `as const`: the compiler needs the tuple type across entries (NG1010). NgModule apps spread them (`...IV_X_IMPORTS`). (since 2026-10-29)
- Renames go through one explicit word-boundary map, which `ivorie migrate` reuses. No ts-morph: names are unique and prefixed. (since 2026-10-23)

## Components

- Components carry shadcn's `cn-*` hook classes verbatim and layout only. Their look lives in theme CSS in `@layer components`, so user classes win. (since 2026-10-28)
- Data parts (meter, gauge, stat, delta, tracker, bar list, sparkline) take their plain look from `tools/styles/parts.css`, so every theme can restyle them. (since 2026-11-23)
- Status colors are fixed: tracker ok/warn/error are green, orange and red in every theme, delta good is green, meter warn is amber. `--tracker-ok` is an opt-in override. (since 2026-11-25)
- Menus are solid. shadcn's `.cn-menu-translucent` stays empty. Glass is the exception: its menus are glass, with the blur on the menu box. (since 2026-11-04)
- Carousel uses CSS scroll-snap, not embla: no dependency, native touch and wheel, plain SSR. No loop or autoplay. The gutter stays before each slide until 2.0, because moving it breaks custom gutters. (since 2026-11-02, gutter 2026-11-26)
- Data table is five standalone features (`ivFilter`, `ivSort`, `ivPagination`, `ivRowSelection`, `ivColumnVisibility`), rows in and rows out, with `manual` for server mode. `ivDataTable` is an optional bundle. (since 2026-11-05)
- Charts are SVG parts on `d3-scale` + `d3-shape`, on the shadcn/Recharts model. The chart entry stays under 45 kB gzipped (about 41 kB today). A chart config `icon` is any Angular component, so the entry has no icon dependency. (since 2026-11-11)
- AI parts and Typography are in the backlog, not in a release. (since 2026-11-23)

## Icons

- Components draw icons with `<svg ivIcon>` and Lucide shapes copied into the library. `@lucide/angular` is one 10.7 MB file that `ng serve` loads whole. (since 2026-11-02)
- `IvIcon` uses static attribute bindings and no effects: faster, and the same markup on server and client. (since 2026-11-04)
- Each `icons/<lib>` entry holds only the component icons. Apps draw their own icons with `<ng-icon>`; `ivorie migrate icons` renames them between libraries. Components keep `<svg ivIcon>` because `ng-icon` host styles beat Tailwind `size-*`. (since 2026-11-04)
- The docs app uses `@lucide/angular`, not `lucide-angular`, which stops at Angular 21. (since 2026-10-23)

## Themes

- One concept: theme. A theme is a CSS file (`theme-<name>.css`, `.theme-<name>`) plus its own defaults: accent, base color, fonts, radius and dials. Users change any default. (since 2026-11-23)
- The 1.5 names alias until 2.0: `style-<name>.css`, `.style-<name>`, `graphite` (now `slate`), `--preset`, `--style`, `--theme <accent>`, old `components.json` keys. (since 2026-11-23)
- The default theme is Slate with the blue accent, for `ivorie init` and the docs site. Glass keeps violet as its own default. (since 2026-11-24)
- Seven own themes (slate, glass, bento, midnight, clay, mono, tint) and four Classic (nova, luma, mira, sera). Vega, maia, rhea and lyra are legacy: they work, stay out of pickers, and leave in 2.0. (since 2026-11-19)
- Every theme differs from every other in at least two of surface, edge, chosen item, hero, data marks and type. Color does not count. (since 2026-11-20)
- Classic themes are synced from shadcn by `tools/styles/sync.ts`, plus a thin Ivorie layer in `tools/styles/classic/<name>.css`. Own themes derive from pure shadcn nova with `tools/styles/derive.ts`. Generated theme files are never edited by hand. (since 2026-11-23)
- Every radius token scales from `--radius`, and the scale is re-declared on every theme element so a `--radius` set below `:root` reaches it. Radius options follow shadcn: `default`, `none`, `small`, `medium`, `large`; no `full`, which would round cards into pills. (since 2026-11-09)
- Theme colors that vary go through CSS variables (`--calendar-*`, `--tracker-ok`), so themes recolor without `!important`. (since 2026-11-23)
- Accents are shadcn's 17, merged in shadcn's order: base color, accent, chart colors, menu accent, radius. (since 2026-11-13)

## Dials

- Dials tune a theme inside its signature. Every theme takes density, contrast and motion; own themes may also take panels, rim, shadow, blur and ambient. A dial a theme does not take is dropped with a note. (since 2026-11-19)
- Density sets `--spacing` on `:root`, so it scales all of the app's Tailwind spacing. The default theme leaves it at `default`. (since 2026-11-26)
- High contrast reaches muted text in own themes through `--iv-muted-keep`, because they declare `--muted-foreground` on every element. (since 2026-11-26)
- The switch track is sized in spacing units, so density scales track and thumb together. (since 2026-11-23)

## Presets and share codes

- A look is data, shared as `ivp1_<base64url JSON>`. There is no `ivp2_`: new fields are optional keys left out at their default, so every old code stays valid. (since 2026-10-28)
- The `ivp1_` JSON keys never change; only the codec maps them (wire `style` is the theme, wire `theme` the accent). (since 2026-11-23)
- `components.json` keeps the whole look as `preset` when the user set a dial. `apply <theme>` carries those dials; a theme's own dial defaults are not saved. (since 2026-11-26)
- Preset fonts are `@fontsource-variable/<name>` packages. The CLI installs them. The playground loads them from jsdelivr in the browser only, except fonts the site self-hosts (Geist, Geist Mono). `npm run check` stays offline. (since 2026-11-02)

## CLI and registry

- The registry is shadcn registry JSON with universal items, so `npx shadcn add` also works. The build rewrites `@inlaylab/ivorie/<name>` imports to `../<name>/public-api`. (since 2026-10-27)
- The CLI has no runtime dependencies. Tests run the TS source on Node 24; npm gets JS from `tsc`. (since 2026-10-28)
- The CLI uses its bundled registry. `--registry <url>` points at the hosted copy (`/r/`). (since 2026-10-28)
- The prefix rewrite is four regexes (`iv-x`, `ivX`, `IvX`, `IV_`); the `iv` prefix is unique. (since 2026-10-28)
- Blocks are self-contained app source with no code shared between blocks. `add` rewrites imports per file and renames icons to the app's library. (since 2026-11-05)
- `init` and `apply` change only Ivorie's own theme names (registry themes and aliases). An app's `theme-dark` class or `theme-overrides.css` import stays. (since 2026-11-26)
- `add` warns when the app's theme file lacks the rules a data part needs, instead of shipping fallback colors in the component. (since 2026-11-26)
- `shadcn add` is checked only by the ubuntu `cli-e2e` CI job: on Windows the shadcn CLI reads `D:\` as a URL scheme. (since 2026-10-29)

## Docs site

- `apps/docs` is the docs and the playground, with SSR from day one, to find SSR bugs early. (since 2026-10-23)
- Content is markdown compiled at build time (marked + shiki). Its HTML is trusted because it is build output from repo files. (since 2026-10-28)
- Demos are one-file default-export components. They feed the docs pages and the SSR route `/all`. (since 2026-10-28)
- The site deploys as a static prerender. `/all` renders only on the Node server, for the SSR smoke. (since 2026-10-28)
- The site runs on the default theme, with colors generated from the default preset, so it shows the theme as installed. No glow, blur or gradients in the chrome; appearance follows the OS. Funnel Display is the display face. (since 2026-11-24)
- The playground preview is a same-origin iframe (`/preview/:kind/:name`) with its own look. Look changes arrive by `postMessage`, dark mode by the `storage` event. (since 2026-11-04)
- Copied commands pin the CLI minor (`npx ivorie@1.6`), or the exact version for a prerelease. The site deploys on every push to `main`, which can come before the npm release. (since 2026-11-26)
- `styles.pack.css` is generated from `styles.css`, so the pack smoke builds the real site. (since 2026-11-26)

## Testing

- Unit specs run on jsdom with Vitest and mock layout sizes. No Vitest browser mode, no Playwright for unit specs. (since 2026-10-27)
- The SSR smoke uses `playwright-core` with system Chrome (`SMOKE_BROWSER`), with no browser download. (since 2026-10-28)
- `npm run check` runs every gate offline and prints pass or fail per gate. (since 2026-10-28)
- The docs initial bundle fails above 900 kB (`angular.json`). (since 1.6.0)

## Process and release

- SemVer with one shared version. A feature is a minor, a fix a patch, a break a major. (since 2026-11-02)
- Branches `feat/`, `fix/`, `chore/` plus a short name. Conventional Commits. Tag `vX.Y.Z` on `main` after each release. (since 2026-11-02)
- One release is one commit: `<type>: release X.Y.Z — <summary>`. No commits between tasks. (since 2026-11-09)
- Changesets bumps both packages and writes the CHANGELOGs. It finds them through `lerna.json`; npm workspaces would link `@inlaylab/ivorie` to the source and break `smoke:pack`. (since 2026-11-02)
- Releases follow user benefit: features first, small releases sooner. A user call can override the semver rule (1.5.1 shipped two themes in a patch). (since 2026-11-03)
- Dependabot, not Renovate: it is built into GitHub. Angular majors are ignored there and done with `ng update`. (since 2026-10-28)

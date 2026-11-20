---
title: CLI
description: Copy components into your app with npx ivorie, shadcn/ui style.
section: guide
group: start
order: 3
---

The `ivorie` CLI copies component source into your app, so you own and edit it. It needs Angular 22 or newer and Node 22.22.3+ or 24.15+. See [Requirements](docs/installation#requirements). It has no runtime dependencies.

## init

Run it once in your Angular workspace:

```bash
npx ivorie init
```

It does this, and never overwrites a file you changed:

1. Writes `components.json`.
2. Writes `<path>/styles/theme.css` (your colors, fonts and dials) and the theme file, for example `theme-slate.css`.
3. Copies `core` (`cn`, ids, positions, the Ivorie config).
4. Adds `@import` lines to your styles file: Tailwind, `tw-animate-css`, the theme's fonts, `theme.css` and the theme file.
5. Adds `class="theme-slate"` to `<body>` in `index.html`.
6. Writes `.postcssrc.json` for `@tailwindcss/postcss`, if no PostCSS config loads it yet.
7. Installs `@angular/cdk`, `tw-animate-css`, the `core` deps, the font packages and Tailwind.

| Flag | Default | Description |
|---|---|---|
| `--project <name>` | the only app | App in `angular.json`. Needed when there are several. |
| `--path <dir>` | `src/app/ui` | Where components go. |
| `--prefix <prefix>` | `iv` | Selector and class prefix: `acme` gives `<acme-tabs>`, `acmeButton`, `AcmeButton`. |
| `--theme <name\|code>` | `glass` | A theme (`glass`, `bento`, `midnight`, `clay`, `slate`, `mono`, `tint`, `nova`, `luma`, `mira`, `sera`) or a code from the playground. |
| `--accent <name>` | the theme's | Accent color over the base color: `base` (none) or `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`. |
| `--base-color <name>` | the theme's | `neutral`, `stone`, `zinc`, `mauve`, `olive`, `mist` or `taupe`. |
| `--font <name>` | the theme's | `system` or a font name, for example `inter`. |
| `--font-heading <name>` | the theme's | `inherit` (same as `--font`) or a font name. |
| `--radius <name>` | the theme's | `default`, `none`, `small`, `medium` or `large`. |
| `--icon-library <name>` | the theme's | `lucide`, `tabler`, `phosphor`, `hugeicons` or `remix`. |
| `--chart-color <name>` | the theme's | `accent` (follow `--accent`), `base` (the base color's greys) or an accent name. |
| `--menu-accent <name>` | the theme's | `subtle` or `bold` (menu highlights in the primary color). |
| `--force` | off | Run again over an existing setup. |
| `-y`, `--yes` | off | No prompts. |
| `--skip-install` | off | Print the install commands instead of running them. |
| `--dry-run` | off | Show what would change. Write nothing. |

## add

```bash
npx ivorie add button dialog
npx ivorie add --all
```

- Copies each component and the components it needs into `<path>/<name>/`.
- Rewrites `@inlaylab/ivorie/<name>` imports to the copied folders, and the prefix to yours.
- A file you changed is skipped. Pass `--overwrite` to replace it.
- Installs the npm packages the components need, unless `--skip-install`.
- Meter, gauge, tracker and bar-list take their colors from your theme file. If that file predates them (an app set up with 1.5), `add` tells you to run `npx ivorie apply <theme>` first.

Import the copy from its folder:

```ts
import { IvButton } from './ui/button/public-api';
```

### Blocks

```bash
npx ivorie add login-01
```

- A block lands in `src/app/blocks/<name>/`, next to `path`. Set `blocksPath` in `components.json` to put blocks elsewhere.
- The components it uses are added too. Each `@inlaylab/ivorie/<name>` import is rewritten to your copy.
- Icons are renamed to your `iconLibrary`. Blocks draw app icons with `@ng-icons/core`, which is installed.
- `--all` adds components only, never blocks.

## migrate

Updates code written for the old `ui-*` components:

```bash
npx ivorie migrate src
```

- Renames symbols, selectors and import paths (`UiButtonComponent` → `IvButton`, `ui-card` → `iv-card`, `.../ui-card/...` → `@inlaylab/ivorie/card`).
- Turns `<ui-button>` into `<button ivButton>`.
- Lists what it cannot fix as `file:line note`, for example `IvTabs.setActive → select`.
- Running it twice changes nothing. `--dry-run` lists the files.

### migrate icons

Moves your own `<ng-icon>` icons to another library:

```bash
npx ivorie migrate icons --from lucide --to tabler src
```

- Renames `@ng-icons` names everywhere in `.ts` and `.html` files (`lucideHouse` → `tablerHome`), and the `@ng-icons/<set>` import.
- Covers 185 common icons. An icon with no match stays as is and is listed.
- Install the new set: `npm i @ng-icons/tabler-icons`.
- The component icons switch with `apply`, not with this command.

## apply

Change the theme of an app that ran `init`. Pass a theme name or a code from the [playground](playground):

```bash
npx ivorie apply ivp1_…
```

It rewrites `theme.css`, writes the new theme file, swaps the theme and font `@import` lines, sets the `<body>` theme class, updates `components.json` and installs new font packages. When the code picks another icon library, it copies that set to `<path>/icons-<lib>/`, adds `provideIvIcons(COMPONENT_ICONS)` to `app.config.ts`, installs `@ng-icons/<set>` and tells you the `migrate icons` command for your own icons. Run it again with the same code and nothing changes. The old theme file stays; delete it if you did not change it. Only Ivorie's own theme classes and imports change: your `theme-dark` class or `theme-overrides.css` import stay. `apply <theme>` keeps the dials saved in `components.json`.

| Flag | Default | Description |
|---|---|---|
| `--project <name>` | the only app | App in `angular.json`. |
| `--skip-install` | off | Print the install command instead of running it. |
| `--dry-run` | off | Show what would change. Write nothing. |

## components.json

| Field | Description |
|---|---|
| `$schema` | The JSON schema, also at `/schema/components.json` on this site. |
| `path` | Where components go. |
| `prefix` | Selector and class prefix. Lowercase letters and digits, starting with a letter. |
| `theme` | The theme. |
| `accent` | Optional. The accent color. Left out: none. |
| `chartColor` | Optional. Where chart colors come from. Left out: the accent. |
| `menuAccent` | Optional. `bold` paints menu highlights in the primary color. Left out: `subtle`. |
| `tailwind.css` | Your styles file. |
| `tailwind.baseColor` | The base color of the theme. |
| `font` | `system` or a font name. |
| `fontHeading` | Optional. The heading font. Left out: same as `font`. |
| `radius` | `default`, `none`, `small`, `medium` or `large`. |
| `iconLibrary` | `lucide`, `tabler`, `phosphor`, `hugeicons` or `remix`. Set by `init` and `apply`. |
| `preset` | Optional. The whole look as an `ivp1_` code, written when you set a dial. `apply <theme>` keeps those dials. |
| `registry` | Optional. A registry dir or URL for `add`. |

## Themes and codes

A theme comes with its own accent, base color, fonts, radius, icon library and dials. Change any of them with the flags above, or in the [playground](playground), which gives a code (`ivp1_…`) for the whole setup. `default` is the slate theme with the blue accent. From 1.3 to 1.5 the default was nova; before 1.3 it was maia. Old codes still work. A legacy theme (vega, maia, rhea, lyra) still works, with a note that it leaves in 2.0. A dial the theme does not take is dropped, with a note. See [Theming](docs/theming).

### Names before 1.6

1.6 calls everything a theme. The old names work until 2.0, each with a note:

- `--theme graphite` and `theme-graphite` are slate, its 1.5 name. They work until 2.0.
- `--preset <name|code>` is `--theme`.
- `--style <name>` swaps only the theme file and keeps the other settings.
- `--theme <accent>` (an accent name, like `blue`) is `--accent`.
- `styles/style-<name>.css` and `class="style-<name>"` still work. `apply` moves an app to `theme-<name>`.
- A `components.json` with `style` and `theme` (the accent) is read as `theme` and `accent`. `apply` rewrites it.

## Registry

The CLI ships its registry. A hosted copy lives on this site at `/r/`:

```bash
npx ivorie add badge --registry https://<docs-host>/r
```

The items use the shadcn registry format, so `npx shadcn add https://<docs-host>/r/r/badge.json` also works.

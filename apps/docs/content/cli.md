---
title: CLI
description: Copy components into your app with npx ivorie, shadcn/ui style.
section: guide
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
2. Writes `<path>/styles/theme.css` and the style file, for example `style-nova.css`.
3. Copies `core` (`cn`, ids, positions, the Ivorie config).
4. Adds `@import` lines to your styles file: Tailwind, `tw-animate-css`, the preset fonts, the theme and the style.
5. Adds `class="style-nova"` to `<body>` in `index.html`.
6. Writes `.postcssrc.json` for `@tailwindcss/postcss`, if no PostCSS config loads it yet.
7. Installs `@angular/cdk`, `tw-animate-css`, the `core` deps, the font packages and Tailwind.

| Flag | Default | Description |
|---|---|---|
| `--project <name>` | the only app | App in `angular.json`. Needed when there are several. |
| `--path <dir>` | `src/app/ui` | Where components go. |
| `--prefix <prefix>` | `iv` | Selector and class prefix: `acme` gives `<acme-tabs>`, `acmeButton`, `AcmeButton`. |
| `--preset <name\|code>` | `default` | Theme preset. |
| `--style <name>` | from the preset | `vega`, `nova`, `maia`, `luma`, `rhea`, `glass`, `brutal`, `aurora`, `bento` or `mono`. |
| `--base-color <name>` | from the preset | `neutral`, `stone`, `zinc`, `mauve`, `olive`, `mist` or `taupe`. |
| `--font <name>` | from the preset | `system` or a font name, for example `inter`. |
| `--font-heading <name>` | from the preset | `inherit` (same as `--font`) or a font name. |
| `--radius <name>` | from the preset | `default`, `none`, `small`, `medium` or `large`. |
| `--icon-library <name>` | from the preset | `lucide`, `tabler`, `phosphor`, `hugeicons` or `remix`. |
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

Change the look of an app that ran `init`. Pass a preset name or a code from the [playground](playground):

```bash
npx ivorie apply ivp1_…
```

It rewrites `theme.css`, writes the new style file, swaps the style and font `@import` lines, sets the `<body>` style class, updates `components.json` and installs new font packages. When the code picks another icon library, it copies that set to `<path>/icons-<lib>/`, adds `provideIvIcons(COMPONENT_ICONS)` to `app.config.ts`, installs `@ng-icons/<set>` and tells you the `migrate icons` command for your own icons. Run it again with the same code and nothing changes. The old style file stays; delete it if you did not change it.

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
| `style` | The component style. |
| `tailwind.css` | Your styles file. |
| `tailwind.baseColor` | The base color of the theme. |
| `font` | `system` or a font name. |
| `fontHeading` | Optional. The heading font. Left out: same as `font`. |
| `radius` | `default`, `none`, `small`, `medium` or `large`. |
| `iconLibrary` | `lucide`, `tabler`, `phosphor`, `hugeicons` or `remix`. Set by `init` and `apply`. |
| `registry` | Optional. A registry dir or URL for `add`. |

## Presets

A preset names a style, a base color, a font, a heading font, a radius and an icon library. Make one in the [playground](playground) and copy its code (`ivp1_…`). `--preset default` is nova, neutral, the system font, the default radius and lucide icons. Before 1.3 the default style was maia; old codes keep their style.

## Registry

The CLI ships its registry. A hosted copy lives on this site at `/r/`:

```bash
npx ivorie add badge --registry https://<docs-host>/r
```

The items use the shadcn registry format, so `npx shadcn add https://<docs-host>/r/r/badge.json` also works.

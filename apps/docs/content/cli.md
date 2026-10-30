---
title: CLI
description: Copy components into your app with npx ivorie, shadcn/ui style.
section: guide
order: 3
---

The `ivorie` CLI copies component source into your app, so you own and edit it. It needs Angular 22 and Node 22.22.3+ or 24.15+. It has no runtime dependencies.

## init

Run it once in your Angular workspace:

```bash
npx ivorie init
```

It does this, and never overwrites a file you changed:

1. Writes `components.json`.
2. Writes `<path>/styles/theme.css` and the style file, for example `style-maia.css`.
3. Copies `core` (`cn`, ids, positions, the Ivorie config).
4. Adds four `@import` lines to your styles file: Tailwind, `tw-animate-css`, the theme and the style.
5. Adds `class="style-maia"` to `<body>` in `index.html`.
6. Writes `.postcssrc.json` for `@tailwindcss/postcss`, if no PostCSS config loads it yet.
7. Installs `@angular/cdk`, `@lucide/angular`, `tw-animate-css`, the `core` deps and Tailwind.

| Flag | Default | Description |
|---|---|---|
| `--project <name>` | the only app | App in `angular.json`. Needed when there are several. |
| `--path <dir>` | `src/app/ui` | Where components go. |
| `--prefix <prefix>` | `iv` | Selector and class prefix: `acme` gives `<acme-tabs>`, `acmeButton`, `AcmeButton`. |
| `--preset <name\|code>` | `default` | Theme preset. |
| `--style <name>` | from the preset | `vega`, `nova`, `maia`, `luma` or `rhea`. |
| `--base-color <name>` | from the preset | `neutral`. |
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

## migrate

Updates code written for the old `ui-*` components:

```bash
npx ivorie migrate src
```

- Renames symbols, selectors and import paths (`UiButtonComponent` → `IvButton`, `ui-card` → `iv-card`, `.../ui-card/...` → `@inlaylab/ivorie/card`).
- Turns `<ui-button>` into `<button ivButton>`.
- Lists what it cannot fix as `file:line note`, for example `IvTabs.setActive → select`.
- Running it twice changes nothing. `--dry-run` lists the files.

## components.json

| Field | Description |
|---|---|
| `$schema` | The JSON schema, also at `/schema/components.json` on this site. |
| `path` | Where components go. |
| `prefix` | Selector and class prefix. Lowercase letters and digits, starting with a letter. |
| `style` | The component style. |
| `tailwind.css` | Your styles file. |
| `tailwind.baseColor` | The base color of the theme. |
| `font` | `system` for now. |
| `radius` | `default` for now. |
| `iconLibrary` | `lucide`. |
| `registry` | Optional. A registry dir or URL for `add`. |

## Presets

A preset names a style, a base color, a font and a radius. Only `--preset default` exists now. Preset codes (`ivp1_…`) come with the theme customizer.

## Registry

The CLI ships its registry. A hosted copy lives on this site at `/r/`:

```bash
npx ivorie add badge --registry https://<docs-host>/r
```

The items use the shadcn registry format, so `npx shadcn add https://<docs-host>/r/r/badge.json` also works.

<div align="center">

<img src="apps/docs/public/app.svg" alt="Ivorie logo" width="88" height="88">

# Ivorie

**Angular components with the [shadcn/ui](https://github.com/shadcn-ui/ui) look and behavior.**
Use them as an npm package, or copy the source into your app and own it.

[![npm](https://img.shields.io/npm/v/@inlaylab/ivorie?label=%40inlaylab%2Fivorie&color=7c3aed)](https://www.npmjs.com/package/@inlaylab/ivorie)
[![CLI](https://img.shields.io/npm/v/ivorie?label=ivorie%20CLI&color=7c3aed)](https://www.npmjs.com/package/ivorie)
[![CI](https://github.com/Inlaylab/ivorie/actions/workflows/ci.yml/badge.svg)](https://github.com/Inlaylab/ivorie/actions/workflows/ci.yml)
[![Angular 22](https://img.shields.io/badge/Angular-22-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

[**Docs**](https://inlaylab.github.io/ivorie/) · [**Playground**](https://inlaylab.github.io/ivorie/playground) · [**Blocks**](https://inlaylab.github.io/ivorie/blocks) · [**Changelog**](CHANGELOG.md)

</div>

## Features

- 🧩 **54 components**, one entry point each (`@inlaylab/ivorie/button`). You ship only what you import.
- 🧱 **22 blocks**: login, sign-up, sidebar and dashboard pages, wired with forms and typed outputs.
- 📊 **Charts**: line, area, bar, pie, radar and radial. SVG, server-rendered, keyboard support.
- 🎨 **13 styles**, 7 base colors, 17 accents, 5 icon libraries. Pick a look in the playground, install it with one command.
- ⚡ **Modern Angular**: signals, zoneless, OnPush, SSR without hydration warnings. Standalone and NgModule apps.
- ♿ **Accessible**: keyboard and ARIA patterns follow [Radix UI](https://github.com/radix-ui/primitives). Every spec runs axe.

## Quick start

### Option 1: the npm package

```bash
npm i @inlaylab/ivorie @angular/cdk
npm i -D tailwindcss @tailwindcss/postcss tw-animate-css
```

```css
/* src/styles.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/style-nova.css";
```

Add `class="style-nova"` to `<body>`, then import what you need:

```ts
import { IvButton } from '@inlaylab/ivorie/button';
```

Full steps: [Installation](https://inlaylab.github.io/ivorie/docs/installation).

### Option 2: copy the source

```bash
npx ivorie init                 # theme, style, components.json
npx ivorie add button dialog    # components land in src/app/ui/
npx ivorie add login-01         # blocks land in src/app/blocks/
```

| | npm package | CLI copy |
|---|---|---|
| Updates | `npm update` | re-run `add` |
| Edit the source | no | yes |
| Best for | most apps | design systems, deep changes |

## Requirements

- Angular 22 (`>=22.0.0 <23.0.0`) and `@angular/cdk`
- Tailwind CSS 4 and `tw-animate-css`
- Node 22.22.3+ or 24.15+, TypeScript 6.0

Angular 21 and older are not supported. See [COMPAT](docs/COMPAT.md).

## Develop

```bash
npm install
npm start                                       # docs at http://localhost:4200
npm run check                                   # every build, test and lint gate
npm run check -- --only test-blocks,test-docs   # some gates only
```

| Script | What it does |
|---|---|
| `npm run check` | Builds the library, CLI, registry and docs. Runs all tests and the SSR smoke. No network. |
| `npm run smoke:pack` | Builds the docs and the NgModule app against the `npm pack` tarball. |
| `npm run smoke:cli` | Two fresh `ng new --ssr` apps: CLI copy and npm package must match. Needs network. |
| `npm run docs:build` | Static docs in `dist/docs/browser`. See [DEPLOY](docs/DEPLOY.md). |

Read [CONTRIBUTING](CONTRIBUTING.md) before you open a PR.

## Roadmap

- **1.6** More theme dials: density, glass thickness.
- **1.7** AI-ready: AGENTS.md, llms.txt, MCP server.

Past releases: [CHANGELOG](CHANGELOG.md). Plan and status: [ROADMAP](ROADMAP.md).

## Documentation

| Doc | About |
|---|---|
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Repo layout, entry points, theme |
| [CONVENTIONS](docs/CONVENTIONS.md) | Component rules and the "add a component" checklist |
| [DECISIONS](docs/DECISIONS.md) | One line per design choice |
| [DEPLOY](docs/DEPLOY.md) | Docs hosting and npm publishing |
| [SECURITY](SECURITY.md) | Report a vulnerability |
| [NOTICE](NOTICE.md) | Credits |

## Support

Ivorie is free and MIT licensed. If it saves you time, you can [buy me a coffee ☕](https://buymeacoffee.com/bhavikbhensajaliya).

## License

[MIT](LICENSE). The look and behavior come from [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT).

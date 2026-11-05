# Ivorie

Angular components with the [shadcn/ui](https://github.com/shadcn-ui/ui) look and behavior.
Accessibility and keyboard patterns follow [Radix UI](https://github.com/radix-ui/primitives).
Built for Angular 22 and Tailwind CSS 4: signals, zoneless, server rendering and keyboard support.

- **`@inlaylab/ivorie`**: the npm package. 53 components, one entry point each (`@inlaylab/ivorie/button`), and 10 styles. Works in standalone, NgModule, SSR and zoneless apps.
- **`ivorie`**: a CLI that copies component source into your app, so you own and edit it. It also adds 19 ready-made blocks: login, sign-up, sidebar and dashboard pages.

## Use the package

```bash
npm i @inlaylab/ivorie @angular/cdk @lucide/angular
npm i -D tailwindcss @tailwindcss/postcss tw-animate-css
```

```css
/* src/styles.css */
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/style-nova.css";
```

Add `class="style-nova"` to `<body>`, then import what you need:

```ts
import { IvButton } from '@inlaylab/ivorie/button';
```

The full steps are on the Installation page of the docs.

## Or copy the source

```bash
npx ivorie init
npx ivorie add button dialog
npx ivorie add login-01        # a block: lands in src/app/blocks/
```

## Develop

```bash
npm install
npm start          # docs at http://localhost:4200
npm run check      # every build, test and lint gate
npm run check -- --only test-blocks,test-docs   # just some gates
```

| Script | What it does |
|---|---|
| `npm run check` | Builds the library, CLI, registry and docs; runs all tests and the SSR smoke. No network. |
| `npm run smoke:pack` | Builds the docs and the NgModule app against the `npm pack` tarball. |
| `npm run smoke:cli` | Two fresh `ng new --ssr` apps: CLI copy vs npm package must match. Needs network. |
| `npm run docs:build` | Static docs in `dist/docs/browser`. See [docs/DEPLOY.md](docs/DEPLOY.md). |

## Releases

- **1.1** More components (popover, sheet, slider, toggle, command, …) and a docs page that lists every example.
- **1.2** Playground: pick style, base color, font and radius, then install that look.
- **1.4** Icon libraries (lucide, tabler, phosphor, hugeicons, remix), five new styles (glass, brutal, aurora, bento, mono), a data table and 19 blocks.
- Next: **1.5** AI-ready (AGENTS.md, MCP server), then **1.6** charts (line, area, bar, pie).

Details: [ROADMAP.md](ROADMAP.md).

## Learn more

- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Conventions: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- Decisions: [docs/DECISIONS.md](docs/DECISIONS.md)
- Credits: [NOTICE.md](NOTICE.md)
- Changes: [CHANGELOG.md](CHANGELOG.md)
- Contribute: [CONTRIBUTING.md](CONTRIBUTING.md)
- Security: [SECURITY.md](SECURITY.md)
- License: [MIT](LICENSE)

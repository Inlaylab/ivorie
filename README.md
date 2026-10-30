# Ivorie

Angular components with the [shadcn/ui](https://github.com/shadcn-ui/ui) look and behavior.
Built for Angular 22 and Tailwind CSS 4: signals, zoneless, server rendering and keyboard support.

- **`@ivorie/ui`**: the npm package. 34 components, one entry point each (`@ivorie/ui/button`). Works in standalone, NgModule, SSR and zoneless apps.
- **`ivorie`**: a CLI that copies component source into your app, so you own and edit it.

## Use the package

```bash
npm i @ivorie/ui @angular/cdk @lucide/angular
npm i -D tailwindcss @tailwindcss/postcss tw-animate-css
```

```css
/* src/styles.css */
@import "@ivorie/ui/styles/theme.css";
@import "@ivorie/ui/styles/style-maia.css";
```

Add `class="style-maia"` to `<body>`, then import what you need:

```ts
import { IvButton } from '@ivorie/ui/button';
```

The full steps are on the Installation page of the docs.

## Or copy the source

```bash
npx ivorie init
npx ivorie add button dialog
```

## Develop

```bash
npm install
npm start          # docs at http://localhost:4200
npm run check      # every build, test and lint gate
```

| Script | What it does |
|---|---|
| `npm run check` | Builds the library, CLI, registry and docs; runs all tests and the SSR smoke. No network. |
| `npm run smoke:pack` | Builds the docs and the NgModule app against the `npm pack` tarball. |
| `npm run smoke:cli` | Two fresh `ng new --ssr` apps: CLI copy vs npm package must match. Needs network. |
| `npm run docs:build` | Static docs in `dist/docs/browser`. See [docs/DEPLOY.md](docs/DEPLOY.md). |

## Learn more

- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Conventions: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- Decisions: [docs/DECISIONS.md](docs/DECISIONS.md)
- Credits: [NOTICE.md](NOTICE.md)
- License: [MIT](LICENSE)

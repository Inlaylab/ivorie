# @inlaylab/ivorie

Angular components with the [shadcn/ui](https://github.com/shadcn-ui/ui) look and behavior. Signals, zoneless, OnPush and server rendering, with one entry point per component.

Docs: https://inlaylab.github.io/ivorie/ · Source: https://github.com/Inlaylab/ivorie

## Requirements

- Angular 22 (`>=22.0.0 <23.0.0`): `core`, `common`, `forms` and `@angular/cdk`
- Tailwind CSS 4 and `tw-animate-css`
- Node 22.22.3+ or 24.15+, TypeScript 6.0+

Angular 21 and older are not supported.

## Setup

```bash
npm i @inlaylab/ivorie @angular/cdk
npm i -D tailwindcss @tailwindcss/postcss tw-animate-css
```

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/theme-slate.css";
```

Put the theme class on the page: `<body class="theme-slate">`. Components have no look without it.

```ts
import { IvButton } from '@inlaylab/ivorie/button';
```

## License

MIT. Credits: shadcn/ui, Radix UI, Lucide (icon shapes, ISC).

# @inlaylab/ivorie

Angular UI components in the style of [shadcn/ui](https://github.com/shadcn-ui/ui).

## Needs

- Angular 22 (`>=22.0.0 <23.0.0`): `core`, `common`, `forms` and `@angular/cdk`
- Node 22.22.3+ or 24.15+, TypeScript 6.0+
- Tailwind CSS 4 + `tw-animate-css`

Angular 21 and older are not supported.

## Setup

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/style-maia.css";
```

Then turn the style on for the page: `<body class="style-maia">`. Without it, components have no look.

Docs: https://github.com/Inlaylab/ivorie

Credits: shadcn/ui, Radix UI, Lucide (icon shapes, ISC). License: MIT.

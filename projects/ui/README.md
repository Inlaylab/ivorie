# @ivorie/ui

Angular UI components in the style of [shadcn/ui](https://github.com/shadcn-ui/ui).

> **Status: pre-release.** APIs will change. Not on npm yet.

## Needs

- Angular 22
- Tailwind CSS 4 + `tw-animate-css`
- `@lucide/angular` (icons)

## Setup (once published)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@ivorie/ui/styles/theme.css";
@import "@ivorie/ui/styles/style-maia.css";
@source "../node_modules/@ivorie/ui";
```

Then turn the style on for the page: `<body class="style-maia">`. Without it, components have no look.

Credits: shadcn/ui, Radix UI, Lucide. License: MIT.

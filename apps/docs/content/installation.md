---
title: Installation
description: Add Ivorie to an Angular app in a few steps.
section: guide
order: 1
---

Ivorie needs Angular 22 and Tailwind 4.

## 1. Install packages

```bash
npm i @ivorie/ui @angular/cdk @lucide/angular
npm i -D tailwindcss @tailwindcss/postcss tw-animate-css
```

## 2. Configure PostCSS

Create `.postcssrc.json` in the project root.

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

## 3. Import the styles

In `src/styles.css`:

```css
@import "@ivorie/ui/styles/theme.css";
@import "@ivorie/ui/styles/style-maia.css";
```

`theme.css` already imports `tailwindcss` and `tw-animate-css`. Do not import them again.

Maia is one of five styles: `vega`, `nova`, `maia`, `luma` and `rhea`. See [Theming](docs/theming).

## 4. Set the style class

Use the class that matches the style file you imported.

In `src/index.html`:

```html
<body class="style-maia">
  <app-root></app-root>
</body>
```

## 5. Provide defaults (optional)

```ts
import { ApplicationConfig } from '@angular/core';
import { provideIvorie } from '@ivorie/ui/core';

export const appConfig: ApplicationConfig = {
  providers: [provideIvorie({ tooltipDelay: 200, sidebarMobile: false })],
};
```

Options:

- `tooltipDelay`: tooltip open delay in ms. Default `0`.
- `sidebarMobile`: start the sidebar in mobile mode before the viewport is known. Default `false`.

NgModule apps use `IvorieModule.forRoot()` with the same options:

```ts
import { IvorieModule } from '@ivorie/ui/core';

@NgModule({ imports: [IvorieModule.forRoot({ tooltipDelay: 200 })] })
export class AppModule {}
```

In an NgModule, spread the import arrays. They are readonly, and NgModule `imports` takes only plain arrays:

```ts
import { IV_TABS_IMPORTS } from '@ivorie/ui/tabs';

@NgModule({ imports: [...IV_TABS_IMPORTS] })
export class AppModule {}
```

For toasts, add `provideIvToast()`:

```ts
import { provideIvToast } from '@ivorie/ui/toast';

providers: [provideIvToast()];
```

## 6. Use a component

```ts
import { Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';

@Component({
  selector: 'app-root',
  imports: [IvButton],
  template: `<button ivButton>Save</button>`,
})
export class App {}
```

## CLI

Prefer to own the source? Copy components into your app instead of installing the package:

```bash
npx ivorie init
npx ivorie add button
```

`init` sets up the theme, the style and Tailwind. `add` copies the component into `src/app/ui/`. See [CLI](docs/cli).

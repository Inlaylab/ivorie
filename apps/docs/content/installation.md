---
title: Installation
description: Add Ivorie to an Angular app in a few steps.
section: guide
order: 1
---

Ivorie needs Angular 22 and Tailwind 4. There are two ways to add it:

- **The CLI** copies component source into your app. You own the code and edit it freely.
- **The npm package** keeps components in `node_modules`. You get fixes with `npm update`.

Both give the same components and the same look. Not sure? Start with the CLI.

## Requirements

| What | Minimum |
|---|---|
| Angular (`core`, `common`, `forms`, `cdk`) | 22.0 (`>=22.0.0 <23.0.0`) |
| Node | 22.22.3, or 24.15 and up |
| TypeScript | 6.0 (what Angular 22 needs) |
| Tailwind CSS | 4.0 |
| `tw-animate-css` | 1.0 |

Angular 21 and older are not supported. The components are tested without zone.js.

## Quick start with the CLI

Run these in your Angular workspace:

```bash
npx ivorie init
npx ivorie add button
```

`init` sets up the theme, the style and Tailwind, and installs what they need. `add` copies the component into `src/app/ui/`. Then use it as shown in [Use a component](docs/installation#use-a-component).

Want a custom look? Build one in the [playground](playground) and copy its `init` command. See [CLI](docs/cli) for every option.

## Install the package

### 1. Install

```bash
npm i @inlaylab/ivorie @angular/cdk
npm i -D tailwindcss @tailwindcss/postcss tw-animate-css
```

### 2. Add PostCSS

Create `.postcssrc.json` in the project root:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

### 3. Import the styles

In `src/styles.css`:

```css
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/style-nova.css";
```

`theme.css` already imports `tailwindcss` and `tw-animate-css`. Do not import them again.

### 4. Set the style class

In `src/index.html`, use the class that matches the style file:

```html
<body class="style-nova">
  <app-root></app-root>
</body>
```

Nova is one of eleven styles: `vega`, `nova`, `maia`, `luma`, `rhea`, `lyra`, `mira`, `sera`, `glass`, `bento` and `mono`. See [Theming](docs/theming).

## Use a component

```ts
import { Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'app-root',
  imports: [IvButton],
  template: `<button ivButton>Save</button>`,
})
export class App {}
```

With the CLI, import from your own folder instead: `./ui/button/public-api`.

## Optional setup

### Defaults

```ts
import { ApplicationConfig } from '@angular/core';
import { provideIvorie } from '@inlaylab/ivorie/core';

export const appConfig: ApplicationConfig = {
  providers: [provideIvorie({ tooltipDelay: 200, sidebarMobile: false })],
};
```

- `tooltipDelay`: tooltip open delay in ms. Default `0`.
- `sidebarMobile`: start the sidebar in mobile mode before the viewport is known. Default `false`.

### Toasts

```ts
import { provideIvToast } from '@inlaylab/ivorie/toast';

providers: [provideIvToast()];
```

### NgModule apps

Use `IvorieModule.forRoot()` with the same options as `provideIvorie`:

```ts
import { IvorieModule } from '@inlaylab/ivorie/core';

@NgModule({ imports: [IvorieModule.forRoot({ tooltipDelay: 200 })] })
export class AppModule {}
```

Spread the import arrays. They are readonly, and NgModule `imports` takes only plain arrays:

```ts
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';

@NgModule({ imports: [...IV_TABS_IMPORTS] })
export class AppModule {}
```

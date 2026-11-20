---
title: Server rendering
description: Ivorie works with server rendering, hydration and zoneless change detection.
section: guide
order: 6
---

Ivorie components render on the server and hydrate in the browser without warnings. They need no zone.js.

## Server rendering and hydration

Add server rendering with the Angular CLI:

```bash
ng add @angular/ssr
```

Turn on hydration in your app config. This site uses event replay too:

```ts
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration(withEventReplay())],
};
```

Components keep server and browser markup the same. Anything that needs the browser (overlays, measuring, focus) runs only in the browser, after the first render.

## Zoneless

Ivorie uses signal inputs, models and `OnPush` everywhere. It does not rely on zone.js to update the view, so it works in a zoneless app. New Angular 22 apps are zoneless by default.

## Overlays

Dialogs, sheets, menus, popovers and toasts open in the CDK overlay container, in the browser. On the server they render nothing until opened.

## Prerendering

Static pages work too. This site is prerendered: every page is HTML on disk, and the components hydrate on load.

## NgModule apps

Every component is standalone. In an NgModule app, add it to the module's `imports`. See [Installation](docs/installation#ngmodule-apps).

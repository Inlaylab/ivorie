# Changelog

## 1.1.0

Both packages: `@inlaylab/ivorie` and `ivorie` 1.1.0. Per-package notes: `projects/ui/CHANGELOG.md`, `projects/cli/CHANGELOG.md`.

- 17 new components: aspect-ratio, empty, kbd, native-select, toggle, toggle-group, slider, popover, sheet, context-menu, menubar, navigation-menu, command, input-otp, resizable, drawer, carousel.
- Faster dev reloads: components draw their icons with the new `IvIcon` (`@inlaylab/ivorie/icon`). `@lucide/angular` (one 10 MB file that `ng serve` loads whole) is no longer a peer dependency. `IvIcon` also draws any icon from the plain `lucide` package.
- Breaking (small): `iv-combobox-input` has no `listboxId` input. Set `id` on `iv-combobox-list` instead.
- Fixes: avatar, null variant/size data attributes, select touched on blur, combobox reset, tooltip and hover card listeners, truncate tooltip side, accordion animation, tabs ids, select picker save on a disabled control.
- Docs: components index at `/docs/components`; every example shows preview and code together.
- Release: Changesets (one version for both packages); npm Trusted Publishing.

## 1.0.0

First release of `@inlaylab/ivorie` and the `ivorie` CLI.

- 34 Angular components, one entry point each (`@inlaylab/ivorie/button`).
- Signals API. Works in standalone, NgModule, SSR and zoneless apps. Angular 22, Tailwind 4.
- shadcn/ui styles: vega, nova, maia, luma, rhea.
- `ivorie` CLI: `init`, `add`, `migrate`.

# Architecture

## Repo layout

```
projects/ui/               npm "@inlaylab/ivorie" (built with ng-packagr)
  core/                    cn(), id generator, overlay helper, provideIvorie()
  button/ dialog/ ...      one folder = one entry point (@inlaylab/ivorie/button)
  meter/ gauge/ stat/ ...  data parts: meter, gauge, stat, delta, tracker, bar-list, sparkline
  chart/                   SVG charts on d3-scale + d3-shape
  icons/<lib>/             component icons for tabler, phosphor, hugeicons, remix
  extras/select-picker/    opinionated parts (dialog + table + checkbox + input)
  styles/                  theme.css tokens and theme-<name>.css themes (style-<name>.css: 1.5 aliases)
projects/blocks/           login, signup, sidebar, dashboard, stats, usage, status pages for `ivorie add`
projects/cli/              npm "ivorie" CLI
apps/docs/                 docs and playground, SSR and prerender
apps/docs/public/r/        generated registry JSON, for the CLI
apps/module-smoke/         NgModule test app
tools/                     gates, docs build, registry, style sync and derive, smoke tests
```

## Entry points

- Each component has its own entry point: `import { IvButton } from '@inlaylab/ivorie/button'`. Apps ship only what they import.
- `core` is shared. A component imports another component only through its entry point, never by relative path.
- `@inlaylab/ivorie/chart`: SVG chart parts on `d3-scale` and `d3-shape`.
- `@inlaylab/ivorie/icons/<lib>`: the icons components use, drawn from another library. Switch with `provideIvIcons(COMPONENT_ICONS)`.

## Dependencies

- `peerDependencies` (the app installs them): `@angular/core|common|forms|cdk >=22.0.0 <23.0.0`, `tailwindcss ^4.0.0`, `tw-animate-css ^1.0.0`.
- `dependencies` (shipped with the library): `class-variance-authority`, `clsx`, `tailwind-merge ^3`, `d3-scale`, `d3-shape`.
- `sideEffects: false`, except `styles/*.css`.
- Version rules: [COMPAT.md](COMPAT.md).

## A component

```ts
@Component({
  selector: 'button[ivButton], a[ivButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class IvButton {
  readonly variant = input<ButtonVariants['variant']>('default');
  readonly class = input<string>('');
  protected readonly classes = computed(() => cn(buttonVariants({ variant: this.variant() }), this.class()));
}
```

Rules for every component: [CONVENTIONS.md](CONVENTIONS.md).

## Themes

- `@inlaylab/ivorie/styles/theme.css` holds the `:root` and `.dark` tokens, `@theme inline` and `@custom-variant dark (&:is(.dark *));`. It sets no font: the app sets `--font-sans`.
- `@inlaylab/ivorie/styles/theme-<name>.css` gives the look. Put `class="theme-<name>"` on `<body>` or any ancestor.
- Components carry shadcn's `cn-*` hook classes. The theme file fills them in `@layer components`, so user classes win.
- A theme is the one thing users pick (`slate`, `glass`, …, `sera`). It is a CSS file plus its own defaults: accent, base color, font, radius and dials. The defaults live in `tools/registry/themes.ts` and reach the CLI as `presets` in the registry index. Users can change each one.
- The 1.5 names (`style-<name>.css`, `.style-<name>`, `graphite`) work until 2.0. The alias file imports the theme file.

### Dials

Dials tune a theme. Every theme takes density, contrast and motion. Own themes that list them (`/* @dials … */` in `tools/styles/own/<name>.css`, `themeDials` in the index) also take panels, rim, shadow, blur and ambient.

- The CLI writes dials as CSS vars in the `:root` block of the app's `theme.css`: `--spacing` (density), `--default-transition-*` (motion), `--iv-panel-solid`, `--iv-rim`, `--iv-shadow`, `--iv-blur`, `--iv-ambient`.
- Density sets `--spacing`, so it scales every Tailwind spacing class in the app, not only Ivorie parts. The default theme leaves it at `default`.
- Contrast remixes `--border`, `--input` and `--muted-foreground`. Own themes declare muted text on every element, so they read `--iv-muted-keep` instead.
- A theme reads the `--iv-*` vars through its own tokens with a fallback, so an unset dial is its default.

### Share codes

`ivp1_` plus base64url JSON holds a whole look. The JSON keeps its 1.5 keys (`style` is the theme, `theme` is the accent) so old codes stay valid; only the codec in `projects/cli/src/preset.ts` maps them. The docs keep a browser copy in `apps/docs/src/app/playground/preset-code.ts`, and `tools/docs/looks.test.ts` keeps the two equal. `components.json` stores the code as `preset` when the user set a dial, so `ivorie apply <theme>` keeps the dials.

### Data parts and cards

- Meter, gauge, tracker and bar-list draw their colors from rules in the theme CSS (`tools/styles/parts.css`); the components carry layout only. `ivorie add` warns when an app's theme file is older than these rules.
- `IvCard` `emphasis="hero"` sets `data-emphasis="hero"`. Each theme styles the hero card its own way.

## App setup

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/theme-slate.css";
@source "../node_modules/@inlaylab/ivorie";
```

## Global config

`provideIvorie({...})` (standalone apps) or `IvorieModule.forRoot({...})` (NgModule apps) sets defaults: button variant and size, dialog, toast position, sidebar cookie name.

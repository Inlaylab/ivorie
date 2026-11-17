# Architecture

## Repo layout

```
projects/ui/               npm "@inlaylab/ivorie" (built with ng-packagr)
  core/                    cn(), id generator, overlay helper, provideIvorie()
  button/ dialog/ ...      one folder = one entry point (@inlaylab/ivorie/button)
  chart/                   SVG charts on d3-scale + d3-shape
  icons/<lib>/             component icons for tabler, phosphor, hugeicons, remix
  extras/select-picker/    opinionated parts (dialog + table + checkbox + input)
  styles/                  theme.css tokens + style-<name>.css looks
projects/blocks/           login, signup, sidebar, dashboard pages for `ivorie add`
projects/cli/              npm "ivorie" CLI
apps/docs/                 docs + playground, SSR and prerender
apps/docs/public/r/        generated registry JSON, for the CLI
apps/module-smoke/         NgModule test app
tools/                     checks, docs build, registry, style sync, smoke tests
```

## Entry points

- Each component has its own entry point: `import { IvButton } from '@inlaylab/ivorie/button'`. Apps ship only what they import.
- `core` is shared. Components import other components only through their entry point, never by relative path.
- `@inlaylab/ivorie/chart`: SVG chart parts on `d3-scale` and `d3-shape`.
- `@inlaylab/ivorie/icons/<lib>`: the icons components use, in another library. Switch with `provideIvIcons(COMPONENT_ICONS)`.

## Dependencies

- **peerDependencies** (the app installs them): `@angular/core|common|forms|cdk >=22.0.0 <23.0.0`, `tailwindcss ^4.0.0`, `tw-animate-css ^1.0.0`.
- **dependencies** (we bring them): `class-variance-authority`, `clsx`, `tailwind-merge ^3`, `d3-scale`, `d3-shape`.
- `sideEffects: false`, except `styles/*.css`.
- Version rules: [COMPAT.md](COMPAT.md).

## How a component looks

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

## Theme

- `@inlaylab/ivorie/styles/theme.css`: `:root` and `.dark` tokens, `@theme inline`, `@custom-variant dark (&:is(.dark *));`.
- No font in the theme. The app sets `--font-sans`.
- `@inlaylab/ivorie/styles/style-<name>.css` gives the look. Put `class="style-<name>"` on `<body>` or any ancestor.
- Components carry shadcn `cn-*` hook classes. The style file fills them in `@layer components`, so user classes win.

App setup:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/style-nova.css";
@source "../node_modules/@inlaylab/ivorie";
```

## Global config

`provideIvorie({...})` (standalone apps) or `IvorieModule.forRoot({...})` (NgModule apps) sets defaults: button variant and size, dialog, toast position, sidebar cookie name.

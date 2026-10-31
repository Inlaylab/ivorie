# Architecture

## Repo layout
```
projects/ui/               npm "@inlaylab/ivorie" (built with ng-packagr)
  core/                    cn(), id generator, overlay helper, provideIvorie()
  button/ dialog/ ...      one folder = one entry point (@inlaylab/ivorie/button)
  extras/select-picker/    opinionated parts (needs dialog + table + checkbox + input)
  styles/theme.css         tokens + @theme inline + dark variant
apps/docs/                 docs + playground, SSR on
apps/module-smoke/         NgModule test app
projects/cli/              npm "ivorie" CLI
apps/docs/public/r/        generated registry JSON per component, for the CLI
tools/                     scripts: checks, docs build, registry, style sync, smoke tests
```

Planned (see [ROADMAP](../ROADMAP.md)):
- Phase 10: registry item kind `block`; `ivorie add <block>` writes to `<path>/blocks/<name>/`.
- Phase 11: `IvIcon` + `provideIvIcons()`, one entry per icon library (`@inlaylab/ivorie/icons/<lib>`).
- Phase 12: `@inlaylab/ivorie/chart` (SVG, `d3-scale` + `d3-shape` if the engine decision holds).

## Entry points
- Each component has its own entry point: `import { IvButton } from '@inlaylab/ivorie/button'`.
- Why: tree-shaking. Apps only ship what they import.
- `core` is shared. Components may import `@inlaylab/ivorie/core`. Components import other components only through their entry point (`@inlaylab/ivorie/button`), never by relative path.

## Dependencies
- **peerDependencies** (app installs them): `@angular/core|common|forms|cdk >=22.0.0 <23.0.0`, `@lucide/angular`, `tailwindcss ^4.0.0`, `tw-animate-css ^1.0.0`.
- **dependencies** (we bring them): `class-variance-authority`, `clsx`, `tailwind-merge ^3`.
- Version rules: [COMPAT.md](COMPAT.md).
- `sideEffects: false`, except `styles/*.css`.
- From 1.4 (Phase 11), icon libraries become optional peers; lucide stays the default.

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
- `@inlaylab/ivorie/styles/theme.css`: `:root` + `.dark` tokens, `@theme inline`, `@custom-variant dark (&:is(.dark *));`.
- No font in the theme. The app sets `--font-sans`.
- App setup:
  ```css
  @import "tailwindcss";
  @import "tw-animate-css";
  @import "@inlaylab/ivorie/styles/theme.css";
  @import "@inlaylab/ivorie/styles/style-maia.css";
  @source "../node_modules/@inlaylab/ivorie";
  ```
- Style: `@inlaylab/ivorie/styles/style-<name>.css` gives the look (maia first). Put `class="style-<name>"` on `<body>` (or any ancestor). Components carry shadcn `cn-*` hooks; the style file fills them, in `@layer components`, so user classes win.

## Global config
`provideIvorie({...})` (standalone apps) or `IvorieModule.forRoot({...})` (NgModule apps). Sets defaults: button variant/size, dialog, toast position, sidebar cookie name.

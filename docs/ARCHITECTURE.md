# Architecture

## Repo layout (target, after Phase 3)
```
projects/ui/               npm "@ivorie/ui" (built with ng-packagr)
  core/                    cn(), id generator, overlay helper, provideIvorie()
  button/ dialog/ ...      one folder = one entry point (@ivorie/ui/button)
  extras/select-picker/    opinionated parts (needs dialog + table + checkbox + input)
  styles/theme.css         tokens + @theme inline + dark variant
apps/docs/                 docs + playground, SSR on
apps/module-smoke/         NgModule test app (Phase 5)
projects/cli/              npm "ivorie" CLI (Phase 6)
registry/                  generated JSON per component, for the CLI (Phase 6)
tools/                     scripts: rename map, checks
```

## Entry points
- Each component has its own entry point: `import { IvButton } from '@ivorie/ui/button'`.
- Why: tree-shaking. Apps only ship what they import.
- `core` is shared. Components may import `@ivorie/ui/core`. Components import other components only through their entry point (`@ivorie/ui/button`), never by relative path.

## Dependencies
- **peerDependencies** (app installs them): `@angular/core|common|forms|cdk >=22.0.0 <23.0.0`, `@lucide/angular`, `tailwindcss ^4.0.0`, `tw-animate-css ^1.0.0`.
- **dependencies** (we bring them): `class-variance-authority`, `clsx`, `tailwind-merge ^3`.
- Version rules: [COMPAT.md](COMPAT.md).
- `sideEffects: false`, except `styles/*.css`.

## How a component looks (after Phase 4)
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
- `@ivorie/ui/styles/theme.css`: `:root` + `.dark` tokens, `@theme inline`, `@custom-variant dark (&:is(.dark *));`.
- No font in the theme. The app sets `--font-sans`.
- App setup:
  ```css
  @import "tailwindcss";
  @import "tw-animate-css";
  @import "@ivorie/ui/styles/theme.css";
  @import "@ivorie/ui/styles/style-maia.css";
  @source "../node_modules/@ivorie/ui";
  ```
- Style: `@ivorie/ui/styles/style-<name>.css` gives the look (maia first). Put `class="style-<name>"` on `<body>` (or any ancestor). Components carry shadcn `cn-*` hooks; the style file fills them, in `@layer components`, so user classes win.

## Global config
`provideIvorie({...})` (standalone apps) or `IvorieModule.forRoot({...})` (NgModule apps). Sets defaults: button variant/size, dialog, toast position, sidebar cookie name.

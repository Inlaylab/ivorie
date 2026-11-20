# Conventions

Every component follows these rules. Use them as the checklist for done.

## Source of truth for look and behavior

shadcn/ui: its radix base and its style files (Ivorie calls them themes). Make a local copy once (gitignored):

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui .ref/shadcn
git -C .ref/shadcn sparse-checkout set apps/v4/registry packages/shadcn
```

- Component: `.ref/shadcn/apps/v4/registry/bases/radix/ui/<name>.tsx`. Copy its structure classes and its `cn-*` hook classes, names unchanged.
- Look: the `.cn-*` rules in `registry/styles/style-<name>.css` go into `projects/ui/styles/theme-<name>.css`, inside `@layer components { :is(.theme-<name>, .style-<name>) { … } }`. Every hook needs a rule in every theme file (empty `{}` is fine). The `test-tools` check enforces it.
- A new theme is a new CSS file. No component changes.
- A part shadcn has no rule for (meter, gauge, stat, …) gets its plain look in `tools/styles/parts.css`, not in the component, so themes can change it. The component keeps layout only. `sync.ts` adds the rules to every theme.
- Where ours differs, follow shadcn unless DECISIONS.md says otherwise.
- Behavior and a11y: shadcn uses Radix. Check Radix docs for keyboard and ARIA, then build it with Angular CDK.
- Port ideas, not React code. `asChild` becomes an attribute selector (`a[ivButton]`).

## Naming

- Selector: element `iv-x`, attribute `[ivX]`. Prefer attribute on a native element when one exists (`button[ivButton]`, `input[ivInput]`, `tr[ivTableRow]`).
- Class: `IvX` (no `Component`/`Directive` suffix).
- Import array: `IV_X_IMPORTS`. Injection token: `IV_X` (no suffix).
- cva: export `xVariants` and type `XVariants` from the entry point.
- Variants: `default | secondary | outline | ghost | destructive | link`. Sizes: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`.

## Component code

1. `input()`, `input.required()`, `output()`. Two-way binding with `model()`. Form controls (CVA) use `input()` + `linkedSignal` + an `xChange` output instead of `model()`, so `writeValue` does not emit. Disabled is the `disabled` input or the form's disabled state, in a `computed`.
   Optional numbers take `{ transform }` so a static attribute (`low="20"`) arrives as a number.
2. Classes with `computed()`. Queries with `viewChild()` / `contentChildren()`.
3. `ChangeDetectionStrategy.OnPush` always.
4. Host classes: `host: { '[class]': 'classes()' }`. Never read `class` from `ElementRef`. Reading other host facts is fine (`IvButton` reads the `tagName`).
5. Every part has a `class` input, merged with `cn()` so the user's classes win.
6. Use `inject()`, not constructor params.

## Forms

Form controls (input, checkbox, switch, radio, select, combobox, calendar) implement `ControlValueAccessor`.
- Works with reactive forms and `ngModel`.
- `setDisabledState` sets disabled.

## Accessibility

- ARIA roles and keyboard like Radix / WAI-ARIA patterns.
- Use `@angular/cdk/a11y`: `FocusTrap`, `FocusMonitor`, `ListKeyManager`, `LiveAnnouncer` (toast).
- Every spec runs `axe-core`.

## SSR safe

- No global `window` or `document`. Use `inject(DOCUMENT)`.
- Measure DOM only inside `afterNextRender`.
- Create overlays only on user action.
- Ids come from `IvIdGenerator`, never `Math.random()` or a module counter: both break hydration and stable prerender output.
- Browser-only APIs (`ResizeObserver`, cookies) behind `afterNextRender` or `isPlatformBrowser`.

## Icons

Use `IvIcon` from `@inlaylab/ivorie/icon`: `<svg ivIcon="chevron-down" class="size-4">`. Never import `@lucide/angular` in the library: it is one 10 MB file that dev servers load whole.

To add an icon, add a row to `tools/icons/names.json` (one name per library), then run `node tools/icons/build.ts`. Never hand-edit generated icon files.

## Versions

Only stable, non-deprecated APIs of the latest Angular. Full list: [COMPAT.md](COMPAT.md#code-rules-stay-working-on-new-versions).

## Tests (one spec file per component)

Vitest, zoneless. Cover inputs, two-way binding, CVA for form controls, keyboard and axe. Write the failing test first.

## Docs

No `readme.md` in the library. Docs live in `apps/docs`.
- One page per component: `apps/docs/content/<name>.md` (start from `_template.md`). Frontmatter: `title`, `description`, `section: component`, `entry`.
- Main demo `apps/docs/src/app/demos/<name>/<name>.ts` is required. It shows at the top, then install, then `## Examples`.
- Each example: a `### Title` and a `<!-- demo: <name>-<example> -->` marker. It renders as preview on top, code below.

## Own themes

- Slate, glass, bento, midnight, clay, mono and tint are own themes: `tools/styles/own/<name>.css`. Line 1 names a synced base: `/* @base nova */`.
- A lone `.cn-x {` rule replaces the base rule for that hook. Every other block (`& {`, `.dark & {`, `& .cn-x {`, selector lists, `@supports`, `@media`) is added after the base rules.
- `node tools/styles/derive.ts <name>|--all` writes `projects/ui/styles/theme-<name>.css` and its alias `style-<name>.css`. Never edit those by hand. `derive.test.ts` fails when they are stale.
- A new own theme also goes in `THEME_INFO` and `THEMES` (`tools/registry/themes.ts`), the `package.json` exports (theme and alias), `tools/check.ts` (attw), `OWN_STYLES` (`tools/structure/theme.test.ts`), `apps/docs/src/styles/theme-<name>.css` and `angular.json`. `contrast.test.ts` must pass.
- Muted text: an own theme mixes `--muted-foreground` from foreground and background and must scale the mix by `var(--iv-muted-keep, 1)`, so the contrast dial reaches it.

## Add a component

1. `projects/ui/<name>/`: `ng-package.json` (copy from `badge`), `public-api.ts`, `<name>.ts`, `<name>.spec.ts` (Vitest + axe).
2. Theme hooks: `node tools/styles/sync.ts <theme>` for vega, nova, maia, luma, rhea, lyra, mira, sera, then `node tools/styles/derive.ts --all`. `tools/styles/coverage.test.ts` must pass.
3. Update the counts: the entry count in `tools/registry/items.test.ts`, and `tools/smoke/module-imports.test.ts` when there is an `IV_<NAME>_IMPORTS`.
4. Module smoke: `apps/module-smoke/src/app/app.module.ts`, `app.html`, and the `data-slot` in `app.spec.ts`.
5. Docs: page + main demo + example demos (see Docs). `npm run docs:content` regenerates `apps/docs/src/generated/`.
6. Check: `npx ng test ui --watch=false`, then `npm run check`.

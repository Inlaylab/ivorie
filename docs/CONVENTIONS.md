# Conventions

Every component must follow these rules. Use this as the "done" checklist.

## Source of truth for look and behavior
shadcn/ui radix base + style files. Make a local copy once (gitignored):

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui .ref/shadcn
git -C .ref/shadcn sparse-checkout set apps/v4/registry packages/shadcn
```

- Component: `.ref/shadcn/apps/v4/registry/bases/radix/ui/<name>.tsx`. Copy its structure classes and its `cn-*` hook classes, names unchanged.
- Look: the `.cn-*` rules in `registry/styles/style-<name>.css` go into `projects/ui/styles/style-<name>.css`, inside `@layer components { .style-<name> { … } }`. Every hook needs a rule in every style file (empty `{}` is fine). The `test-tools` check enforces it.
- First style: maia. More styles are new CSS files, no component changes.
- If ours differ, use shadcn unless DECISIONS.md says otherwise.
- Behavior and a11y: shadcn uses Radix. Check Radix docs for keyboard and ARIA, then build it with Angular CDK.
- Port ideas, not React code. `asChild` → attribute selector (`a[ivButton]`).

## Naming
- Selector: element `iv-x`, attribute `[ivX]`. Prefer attribute on a native element when one exists (`button[ivButton]`, `input[ivInput]`, `tr[ivTableRow]`).
- Class: `IvX` (no `Component`/`Directive` suffix).
- Import array: `IV_X_IMPORTS`. Injection token: `IV_X` (no suffix).
- cva: export `xVariants` and type `XVariants` from the entry point.
- Variants: `default | secondary | outline | ghost | destructive | link`. Sizes: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`.

## Component code
1. `input()`, `input.required()`, `output()`. Two-way binding with `model()`. CVA form controls: `input()` + `linkedSignal` + `xChange` output, not `model()`, so `writeValue` does not emit. Disabled = `disabled` input OR form-disabled (`computed`).
2. Classes with `computed()`. Queries with `viewChild()` / `contentChildren()`.
3. `ChangeDetectionStrategy.OnPush` always.
4. Host classes: `host: { '[class]': 'classes()' }`. Never read `class` from `ElementRef`.
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
- Ids from the id service, never `Math.random()` (else hydration mismatch).
- Browser-only APIs (`ResizeObserver`, cookies) behind `afterNextRender` or `isPlatformBrowser`.

## Icons
Use `@lucide/angular` (not `lucide-angular`). Import the icons the component needs inside the component. The user must not register them.

## Versions
Only stable, non-deprecated APIs of the latest Angular. Full list: [COMPAT.md](COMPAT.md#code-rules-stay-working-on-new-versions).

## Tests (one spec file per component)
Vitest. Cover: inputs, two-way binding, CVA (if a form control), keyboard, axe. Tests run zoneless (default).

## Docs
No `readme.md` in the library. Docs live in `apps/docs`.

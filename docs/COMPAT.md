# Version support

**Target: latest versions.** Checked 2026-10-23.

| Package | Latest | Our range |
|---|---|---|
| `@angular/core`, `common`, `forms`, `cdk` | 22.2 | `>=22.0.0 <23.0.0` |
| `tailwindcss` | 4.3.3 | `^4.0.0` |
| `tw-animate-css` | 1.4.0 | `^1.0.0` |
| `@lucide/angular` | 1.61.0 | `>=1.61.0` (peer `@angular/core >=17`) |
| `tailwind-merge` (dep) | 3.7.0 | `^3.0.0` |
| Node | — | `^22.22.3` or `^24.15.0` (Angular 22 needs it) |
| TypeScript | 6.0 | `>=6.0 <6.1` (Angular 22 needs it) |

`lucide-angular` (old package) only allows Angular up to 21. We use `@lucide/angular` instead.

## Minimum versions
Angular 22 is the floor. Angular 21 and older are not supported: the build, tests and CLI only run on 22. Parked 2026-11-06 (see [DECISIONS.md](DECISIONS.md)); the effort estimate is Angular 21+ about 2–3 days, 20+ about 3–5 days.

## New Angular major (23 is due ~Nov 2026)
1. CI has a job on `@angular/core@next`. It runs weekly (Monday) and by hand, not on PRs. It may fail, but it warns early.
2. When the new major ships: `ng update` the workspace → `npm run check` → fix.
3. Raise the peer range to the new major. Release.
4. We support the latest major only (plus the one before it, while it still works in CI without code forks).

## Code rules (stay working on new versions)
Use only stable, non-deprecated APIs of the latest Angular.
- Yes: `input()`, `model()`, `output()`, `computed()`, `linkedSignal()`, `effect()`, `viewChild()`, `contentChildren()`, `inject()`, `afterNextRender`, `afterEveryRender`, `DestroyRef`, `REQUEST`, `host: {}`, `@if`/`@for`/`@let`.
- No: `@Input`/`@Output`/`@ViewChild` decorators, `*ngIf`/`*ngFor`, `@HostBinding`/`@HostListener`, `@angular/animations`, `ngClass`/`ngStyle`, `NgZone`, private `ɵ` APIs, experimental APIs (e.g. signal forms) until stable.
- Zoneless is the default since Angular 21. Every component must work without zone.js.
- Tailwind: v4 syntax only (`@theme`, `@custom-variant`, `@source`, `data-[state=…]:`). Full class names in code (no `'bg-' + color`), so Tailwind finds them.

`tools/check.ts` gets a `no-deprecated-api` rule for the "No" list in Phase 4.

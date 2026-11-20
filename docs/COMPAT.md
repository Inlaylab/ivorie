# Version support

**Target: latest versions.** Checked 2026-10-23.

| Package | Latest | Our range |
|---|---|---|
| `@angular/core`, `common`, `forms`, `cdk` | 22.2 | `>=22.0.0 <23.0.0` |
| `tailwindcss` | 4.3.3 | `^4.0.0` |
| `tw-animate-css` | 1.4.0 | `^1.0.0` |
| `tailwind-merge` (dep) | 3.7.0 | `^3.0.0` |
| Node | 24 (dev) | `^22.22.3` or `^24.15.0` (Angular 22 needs it) |
| TypeScript | 6.0 | `>=6.0 <6.1` (Angular 22 needs it) |

The library has no icon peer: components draw icons with `IvIcon`. The docs app uses `@lucide/angular` (not the old `lucide-angular`, which stops at Angular 21).

## Minimum versions

Angular 22 is the floor. Angular 21 and older are not supported: the build, tests and CLI only run on 22. Support for older versions was parked on 2026-11-06 (see [DECISIONS.md](DECISIONS.md)). Estimate if it comes back: 2 to 3 days for Angular 21+, 3 to 5 days for 20+.

## New Angular major (23 is due about Nov 2026)

1. The `angular-next` CI job runs on `@angular/core@next` every Monday and by hand, not on PRs. It may fail; its job is to warn early.
2. When the new major ships: `ng update` the workspace, `npm run check`, fix.
3. Raise the peer range to the new major. Release.
4. We support the latest major, plus the one before it while it works in CI without code forks.

## Code rules (stay working on new versions)

Use only stable, non-deprecated APIs of the latest Angular.
- Yes: `input()`, `model()`, `output()`, `computed()`, `linkedSignal()`, `effect()`, `viewChild()`, `contentChildren()`, `inject()`, `afterNextRender`, `afterEveryRender`, `DestroyRef`, `REQUEST`, `host: {}`, `@if`/`@for`/`@let`.
- No: `@Input`/`@Output`/`@ViewChild` decorators, `*ngIf`/`*ngFor`, `@HostBinding`/`@HostListener`, `@angular/animations`, `ngClass`/`ngStyle`, `NgZone`, private `ɵ` APIs, and experimental APIs (signal forms, for example) until they are stable.
- Zoneless is the default since Angular 21. Every component must work without zone.js.
- Tailwind: v4 syntax only (`@theme`, `@custom-variant`, `@source`, `data-[state=…]:`). Full class names in code (no `'bg-' + color`), so Tailwind finds them.

The `no-deprecated-api` rule in `tools/check.ts` enforces the "No" list.

# Ivorie — Roadmap

Single source for plan, status and next work. Updated 2026-10-30.

## Goal
Ship the Ivorie Angular components as open source.
- **`@inlaylab/ivorie`** is the npm package: 34 components, one entry point each (`@inlaylab/ivorie/button`). It works in standalone, NgModule, SSR and zoneless apps.
- **`ivorie`** is a CLI that copies component source into an app, like shadcn.
- The library source is the only source of truth. The CLI copies from it.

Fixed choices:
- Brand **Ivorie**. Element selector `iv-x`, attribute `ivX`, class `IvX`.
- Signals API from v1.0. Tailwind v4 is required.
- Latest versions only: Angular 22, Tailwind 4.3, zoneless, Vitest, `@lucide/angular`.

More detail: [ARCHITECTURE](docs/ARCHITECTURE.md) · [CONVENTIONS](docs/CONVENTIONS.md) · [COMPAT](docs/COMPAT.md) · [DECISIONS](docs/DECISIONS.md) · [DEPLOY](docs/DEPLOY.md).

## Status
**Next:** Phase 7 — Release v1.0 (outline only: expand into tasks and get an OK first).
Both packages are at `1.0.0` and are not published yet. Docs initial bundle is ~800 kB, mostly lucide icons (fix: icon plugins in the v1.x backlog).

| # | Phase | Status |
|---|---|---|
| 7 | Release v1.0 (npm publish) | outline only |
| — | v1.x | backlog |

## Must do (before v1.0)
Owner in brackets. Items marked "user" need a person, not code.
1. **[user] Name and legal checks (start now, slow):** npm org `@inlaylab` done. Left: unscoped `ivorie` CLI name free on npm, trademark, company legal OK.
2. **GitHub home:** done. Repo `Inlaylab/ivorie`, npm `@inlaylab/ivorie` + `ivorie` (CLI).
3. **[user] CI green on GitHub.** Check the Actions tab: `check` (lock + tailwind-latest), `pack`, `cli-e2e`. Phase 7 needs it.
4. Never touch the source app the components came from (`D:\idemeum\adminportal`).

## How we work
- One phase = one branch = one PR. Branch name: `phase-N-short-name`.
- Finish a task, run its check, commit, then update **Status** here.
- An outline-only phase is expanded into tasks (superpowers:writing-plans) and OK'd before work starts.
- A phase is done only when its exit gate passes. Run the commands and show the output.
- A new big choice gets one line in [DECISIONS.md](docs/DECISIONS.md).
- No AI attribution lines in commits or PRs.
- Docs stay short and plain.

| What | Command |
|---|---|
| Build library | `npx ng build ui` |
| Unit tests | `npx ng test ui --watch=false` |
| Docs app | `npm start` (http://localhost:4200) |
| All gates (no network) | `npm run check` |
| Package smoke | `npm run smoke:pack` |
| CLI smoke (network) | `npm run smoke:cli` |
| Static docs | `npm run docs:build` |

`npm run check` runs these steps:
- build-ui, test-tools, publint, attw, test-ui
- test-cli, build-registry, build-cli, test-cli-bin, publint-cli
- build-docs, smoke-ssr, test-docs, build-module-smoke, test-module-smoke

It also runs these grep rules:
- no-ui-prefix, no-root-import, no-relative-cross-import, no-lib-readme
- no-input-decorator, no-deprecated-api, no-dom-globals

---

## Pending 

### Phase 7 — Release v1.0 (outline only)
Branch `phase-7-release`. Expand into tasks and get an OK before starting.
**Publishing is public and cannot be undone. Ask the user before every publish.**

**Goal:** `@inlaylab/ivorie` and `ivorie` v1.0.0 on npm, published from CI with provenance.

Scope:
1. **Manual checks:**
   - The npm org `@inlaylab` is owned (done). The CLI name `ivorie` is free on npm.
   - Trademark is checked.
   - Company legal is OK.
2. **Repo files:**
   - Add CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, and issue and PR templates.
   - README credits shadcn/ui and Radix. Radix is in NOTICE.md but not in the README yet.
3. **Changesets** for versions and the CHANGELOG.
4. **Publish workflow:**
   - GitHub Actions runs `npm publish --provenance`.
   - Uses the GitHub home chosen in Must do #3.
5. **Final check:** install from npm into two fresh apps:
   - a standalone SSR app;
   - an NgModule app.

   All components render, with no hydration warnings.

**Exit gate:**
- Both packages are on npm with provenance.
- The fresh-app check passes.
- The source app the components were copied from is untouched.

### Deferred review findings (minor)
None blocks v1.0. Fix them when you touch the file, or in v1.x.

**Leaf (Phase 4 A)**
- Avatar state is not reset when `src` changes.
- `tools/styles/sync.ts` silently skips unknown rule shapes.
- `data-variant` and `data-size` vanish when `[variant]="null"`.
- `IvButton` reads the `ElementRef` tagName. Note it as allowed in CONVENTIONS.

**Form (Phase 4 B)**
- Select:
  - The "empty list" spec asserts nothing, and there is no fully-disabled-list case.
  - The control is touched only on close.
- Combobox:
  - The list `[id]` and the input `[listboxId]` are separate inputs.
  - A parent `[value]` reset after the first render is not shown.
- Checkbox: indeterminate is unfilled in maia. This matches Radix.
- Radio group: naming of `_disabled` vs `isDisabled`.

**Overlay (Phase 4 C)**
- Tooltip and hover card:
  - Each tooltip adds 2 document listeners, and each hover card adds 1 more.
  - The Escape listener is redundant with the CDK dispatcher.
- Truncate tooltip: the panel `data-side` is hard-coded to `top`.
- Toast: these two are documented, not fixed:
  - `toasts$` is async and coalesced.
  - `provideIvToast` checks for a manual container only once.

**Layout (Phase 4 D)**
- Accordion: the open animation ends at `auto` (no content-height variable), and there is no close animation.
- Tabs: `toIdPart` collides (`"a b"` vs `"a_b"`).

**Extras (Phase 4 E)**
- The `no-dom-globals` rule:
  - It misses `globalThis.window.`, `window?.`, `window[...]` and `fromEvent(window)`.
  - It flags comments.
- Dialog: Save writes to a control that became form-disabled while the dialog was open.

**Docs and smoke (Phase 5)**
- Doc page:
  - `track $index` may carry demo tab state across pages.
  - The meta description is not reset on non-doc pages.
- Boot script: it accepts any `[a-z]+` style, so a bad value flashes until hydration.
- Markdown:
  - Raw HTML in markdown prose is trusted. It is repo-authored.
  - `api.test` argument capture stops at the first `)`.
  - A four-backtick demo would break its code block.
- `ssr.ts`: the `at` label may blame the next page.
- `pack.ts`: it leaves other `--no-save` tree changes behind.

### Upcoming features (v1.x backlog)
- **Styles and themes:**
  - A theme builder or customizer page.
  - Preset base colors (`tools/registry/base-colors/<name>.json`).
  - Fonts, radius options and a style picker.
  - Presets are already data: `{ style, baseColor, font, radius }`, with share code `ivp1_…`.
  - A "Playground" tab in the top bar: build a theme preset, then install it.
- **Icon libraries as plugins:** lucide, tabler, phosphor, hugeicons, remix, picked like a theme.
  - Components render one shared icon from a semantic name set. A plugin provides the data.
  - The CLI can rewrite icon imports at install time (shadcn `iconLibrary`).
  - Also cuts the docs bundle: today each lucide icon is a full component (~3 kB compiled template), and all 33 used icons land in the initial chunk (~112 kB).
- **Components:** shadcn components we do not have yet.
- **Tests:** Playwright visual regression tests.
- **Docs:** search and versioned docs.
- **CLI:**
  - `ivorie apply`, `ivorie list` and `ivorie diff`.
  - Custom third-party registries.
  - An interactive component picker.
- **Angular 23** (due about Nov 2026):
  - Watch the `angular-next` CI job.
  - Then `ng update`, `npm run check`, and raise the peer range. See [COMPAT](docs/COMPAT.md).


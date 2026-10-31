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
**Next:** Phase 7 — Release v1.0. Tasks written, waiting for the user's OK. See U1–U5 and tasks 1–8.
Done: GitHub repo `Inlaylab/ivorie` and npm org `@inlaylab` exist. Package renamed to `@inlaylab/ivorie`. `npm run check` passes.
Both packages are at `1.0.0` and are not published yet. Docs initial bundle is ~800 kB, mostly lucide icons (fix: icon plugins in the v1.x backlog).

| # | Phase | Status |
|---|---|---|
| 7 | Release v1.0 (npm publish) | tasks written, awaiting OK |
| — | v1.x | backlog |

## Must do (before v1.0)
Owner in brackets. Items marked "user" need a person, not code.
1. **[user] Name and legal checks (start now, slow):** left: unscoped `ivorie` CLI name free on npm (`npm view ivorie` gives 404), trademark, company legal OK.
2. **GitHub home and npm org:** done. Repo `Inlaylab/ivorie`, org `@inlaylab`, packages `@inlaylab/ivorie` + `ivorie` (CLI).
3. **[user] Push `main` to `Inlaylab/ivorie`, then CI green.** Check the Actions tab: `check` (lock + tailwind-latest), `pack`, `cli-e2e`. Phase 7 needs it.
4. **[user] npm auth for CI:** 2FA on, owner of `inlaylab`. Make a granular token with publish rights on `@inlaylab/*` and `ivorie`. Save it as GitHub secret `NPM_TOKEN`. Trusted Publisher can replace it after the first publish.

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

### Phase 7 — Release v1.0
Branch `phase-7-release`. Tasks below are OK'd by the user before work starts.
**Publishing is public and cannot be undone. Ask the user before every publish.**

**Goal:** `@inlaylab/ivorie` and `ivorie` v1.0.0 on npm, published from CI with provenance.

**User steps (code cannot do these):**
- U1. [done] Git history: local `main` and `origin/main` are unrelated root commits (both "v1.0.0"). Only `ROADMAP.md` differs, and local is newer. Fix: force-push local `main` over `origin/main` (ask first), or recreate the remote repo.
- U2. [done] Name and legal: `ivorie` is free on npm today (`npm view ivorie` gives 404). Trademark and company legal OK are still open. The unscoped name can be taken by anyone until we publish.
- U3. [done] CI green on GitHub after U1: `check` (lock + tailwind-latest), `pack`, `cli-e2e`.
- U4. [done] `NPM_TOKEN`: 2FA on, owner of `inlaylab`. Granular token, publish rights on `@inlaylab/*` and `ivorie`. Save as GitHub secret `NPM_TOKEN`. A new package cannot use Trusted Publisher before its first publish.
- U5. [open] Give a contact email for SECURITY.md and CODE_OF_CONDUCT.md (task 2).

**Tasks (code):**
1. **Package metadata.** Add `homepage`, `bugs` and `keywords` to `projects/ui/package.json` and `projects/cli/package.json`. Check: `npm run check` (publint, publint-cli).
2. **Repo files.** Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (done, needs `CONTACT_EMAIL` filled), `SECURITY.md` (done), `.github/ISSUE_TEMPLATE/{bug,feature}.yml`, `.github/PULL_REQUEST_TEMPLATE.md`. Add a Radix UI credit to `README.md` next to shadcn/ui. Needs U5.
3. **CHANGELOG.** Hand-written `CHANGELOG.md` with a 1.0.0 entry. No Changesets for 1.0.0 (one line in DECISIONS.md). Add Changesets in 1.1.
4. **Release workflow.** Add `.github/workflows/release.yml`:
   - Trigger: manual only (`workflow_dispatch`), and only on `main`. Permissions: `contents: read`, `id-token: write`.
   - Steps: checkout, setup-node (`registry-url: https://registry.npmjs.org`), `npm ci`, fail if the two package versions differ, `npm run check`, then `npm publish dist/ui --provenance --access public` and `npm publish dist/cli --provenance --access public`.
   - Auth: `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
   - Check: `repository.url` in both packages is `git+https://github.com/Inlaylab/ivorie.git`.
5. **Pre-publish checks.** Run `npm run check`, `npm run smoke:pack`, `npm run smoke:cli`. Then `npm publish --dry-run` in `dist/ui` and `dist/cli`. Read both file lists: no `.ref`, tests, or source maps of private code.
6. **PR and merge.** Open the PR `phase-7-release` into `main`. CI green. Merge.
7. **Publish (ask the user first).** Run the `Release` workflow from the GitHub Actions tab on `main`. Watch the run. Check `npm view @inlaylab/ivorie` and `npm view ivorie` show 1.0.0 with provenance.
8. **Final check.** Install from npm into two fresh apps: a standalone SSR app and an NgModule app. All components render, no hydration warnings.

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


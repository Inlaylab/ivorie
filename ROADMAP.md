# Ivorie — Roadmap

Single source for plan, status and next work. Updated 2026-10-31.

## Goal
Ship the Ivorie Angular components as open source.
- **`@inlaylab/ivorie`** is the npm package: 34 components in 1.0, one entry point each (`@inlaylab/ivorie/button`). It works in standalone, NgModule, SSR and zoneless apps.
- **`ivorie`** is a CLI that copies component source into an app, like shadcn.
- The library source is the only source of truth. The CLI copies from it.

Fixed choices:
- Brand **Ivorie**. Element selector `iv-x`, attribute `ivX`, class `IvX`.
- Signals API from v1.0. Tailwind v4 is required.
- Latest versions only: Angular 22, Tailwind 4.3, zoneless, Vitest, `@lucide/angular`.

More detail: [PLAN](docs/PLAN.md) · [ARCHITECTURE](docs/ARCHITECTURE.md) · [CONVENTIONS](docs/CONVENTIONS.md) · [COMPAT](docs/COMPAT.md) · [DECISIONS](docs/DECISIONS.md) · [DEPLOY](docs/DEPLOY.md).

## Status
**Next:** Phase 8, task T0 (release hygiene).
Shipped: 1.0.0 (both packages). Docs initial bundle is ~800 kB, mostly lucide icons (fixed in Phase 11).

| # | Release | What | Status |
|---|---|---|---|
| 8 | 1.1.0 | Components + quick wins | next |
| 9 | 1.2.0 | Playground: themes, colors, fonts | planned |
| 10 | 1.3.0 | Blocks | planned |
| 11 | 1.4.0 | Icon libraries as plugins | planned |
| 12 | 1.5.0 | Charts | planned |

Order is by benefit to users. New features ship as minor releases (1.x.0). A patch (1.x.y) is for bug fixes only.

## Must do (now)
Owner in brackets. Items marked "user" need a person, not code.
1. **[user] Confirm 1.0.0 on npm:** `npm view @inlaylab/ivorie version` and `npm view ivorie version` both print `1.0.0`.
2. **[user] Trusted Publisher:** on npmjs.com, for each package: Settings → Trusted Publisher → GitHub Actions, repo `Inlaylab/ivorie`, workflow `release.yml`. Then Phase 8 T0 drops `NPM_TOKEN`.
3. **[user] Trademark and company legal OK** for the name, if still open.

## How we work
- One phase = one release = one branch = one PR. Branch name: `phase-N-short-name`.
- Finish a task, run its check, commit, then update **Status** here.
- A phase marked "outline" is expanded into tasks (superpowers:writing-plans) and OK'd before work starts.
- A phase is done only when its exit gate passes. Run the commands and show the output.
- The last task of each phase: Changesets version bump, CHANGELOG entry, release.
- **Publishing is public and cannot be undone. Ask the user before every publish.**
- New components follow the "Add a component" checklist in [CONVENTIONS](docs/CONVENTIONS.md).
- Docs site UI work: use the frontend-design skill.
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
| Manual publish (ask first) | `npm run publish:all` |

`npm run check` runs these steps:
- build-ui, test-tools, publint, attw, test-ui
- test-cli, build-registry, build-cli, test-cli-bin, publint-cli
- build-docs, smoke-ssr, test-docs, build-module-smoke, test-module-smoke

It also runs these grep rules:
- no-ui-prefix, no-root-import, no-relative-cross-import, no-lib-readme
- no-input-decorator, no-deprecated-api, no-dom-globals

---

## Phase 8 — Release 1.1.0: Components + quick wins
Branch `phase-8-components`. Tasks are OK'd.

**Goal:** browse all components and all their examples easily, add the missing shadcn components, fix the small known bugs.

### T0. Release hygiene
- **Trusted Publishing** (needs Must do #2):
  - `.github/workflows/release.yml`: remove `NODE_AUTH_TOKEN` env. Keep `id-token: write` and `--provenance`. npm signs in with GitHub OIDC (npm ≥ 11.5).
  - Delete the `NPM_TOKEN` secret and the npm token after the first OIDC publish works.
  - Keep `npm run publish:all` as the manual fallback (no provenance).
- **Changesets:**
  - Add `@changesets/cli` (dev dep) and `.changeset/config.json`.
  - `fixed: [["@inlaylab/ivorie", "ivorie"]]`: both packages always share one version.
  - The root package is private. Changesets must version `projects/ui` and `projects/cli` (workspaces or `packages` config; pick at task start).
  - Release flow: `npx changeset` per change, `npx changeset version` at release. It writes `CHANGELOG.md`.
- **Check:** `npx changeset status` lists both packages. `npm run check` green.

### T1. Docs: components index page
- New route `/docs/components`: a grid of every component page. Each card shows the name, the one-line description from frontmatter, and links to the page.
- Data comes from `PAGES` (`apps/docs/src/generated/pages.ts`), filtered by `section: component`. No hand-kept list.
- Top bar "Components" (`apps/docs/src/app/shell/site-header.ts:47-49`) links to `/docs/components`. Today it opens the first page (accordion).
- Sidebar "Components" group gets an "Overview" link at the top.
- Prerender the route (SSR). Add it to the SSR smoke (`tools/smoke/ssr.ts`).
- Use the frontend-design skill.
- **Check:** `test-docs` spec for the page (one card per component page, links resolve), axe clean.

### T2. Docs: every example in a list (shadcn and zard layout)
- `apps/docs/src/app/ui/demo-frame.ts`: preview on top and code below, in one card. No Preview/Code tabs.
  - Code is collapsed to ~10 lines, with an "Expand" button and a fade. Copy button on the code.
  - Preview area: centered, min-height, padding, same as today.
- Page order stays: main demo, install, then `## Examples` with one `### Title` + stacked frame per demo (`tools/docs/content.ts:135-159`).
- Fix `track $index` (`apps/docs/src/app/pages/doc-page.ts:33`): rebuild frames on page change (`@for (r of [resolved]; track r.page.slug)`).
- Fix the four-backtick fence (`tools/docs/content.ts:154`): use a fence longer than the longest backtick run in the demo source.
- Update `apps/docs/src/app/pages/doc-page.spec.ts` and `tools/docs/content.test.ts`.
- Use the frontend-design skill.
- **Check:** `npm run check` (test-tools, test-docs, smoke-ssr).

### T3. New components, wave A (markup + CSS)
- `aspect-ratio`, `empty`, `kbd`, `native-select`.
- Skipped: standalone `label` and `textarea` entries. They already exist in `@inlaylab/ivorie/input` (`label[ivLabel]`, `textarea[ivTextarea]`).

### T4. New components, wave B (CDK, no new deps)
- `toggle` (`aria-pressed`), `toggle-group` (single/multiple, `ListKeyManager`, CVA).
- `slider` (pointer + keyboard, CVA, range support).
- `popover` (CDK overlay, reuse hover-card / dropdown-menu pattern and `core` positions).
- `sheet` (CDK Dialog docked to an edge: top, right, bottom, left; reuse the dialog service).
- `context-menu` (dropdown-menu content, opened at the pointer).
- `menubar` (row of dropdown menus, roving focus).
- `navigation-menu` (overlay viewport + motion).

### T5. New components, wave C (hand-rolled, no new deps)
- `command` (`ListKeyManager` + filter; reuse combobox internals).
- `input-otp` (hidden input + slots, paste, CVA).
- `resizable` (panel group + handles, pointer events + keyboard).
- `drawer` (sheet + drag to close).
- `carousel`: decide at task start between `embla-carousel` core as an optional peer, or CSS scroll-snap. One DECISIONS line.

### Per new component (all of T3–T5)
Follow the "Add a component" checklist in [CONVENTIONS](docs/CONVENTIONS.md):
- Library files, specs (Vitest + axe), style sync for all 5 styles.
- Count bumps: `tools/registry/items.test.ts:24`, `tools/smoke/module-imports.test.ts:34` (only with `IV_*_IMPORTS`).
- Module smoke app, docs page, main demo, example demos.
- **Check per component:** `npx ng test ui --watch=false`. **Check per wave:** `npm run check`, commit.

### T6. Quick wins (deferred review findings)
Fix:
- Avatar: reset state when `src` changes.
- `data-variant` and `data-size` vanish when `[variant]="null"`.
- Select: control touched only on close; "empty list" spec asserts nothing; add a fully-disabled-list case.
- Combobox: one id input instead of list `[id]` + input `[listboxId]`; show a parent `[value]` reset after first render.
- Radio group: rename `_disabled` / `isDisabled` to one name.
- Tooltip and hover card: share document listeners; drop the Escape listener (the CDK dispatcher has it).
- Truncate tooltip: real `data-side` instead of hard-coded `top`.
- Accordion: content-height variable for open, add a close animation.
- Tabs: `toIdPart` collision (`"a b"` vs `"a_b"`).
- Dialog: Save must not write to a control that became disabled while open.
- `no-dom-globals` rule: catch `globalThis.window.`, `window?.`, `window[...]`, `fromEvent(window)`; ignore comments.
- Docs: reset the meta description on non-doc pages. Boot script accepts only known style names.
- `tools/smoke/ssr.ts`: the `at` label must name the failing page. `tools/smoke/pack.ts`: undo other `--no-save` tree changes.
- `tools/styles/sync.ts`: warn on unknown rule shapes.
- CONVENTIONS: note that `IvButton` reading the `ElementRef` tagName is allowed.

Won't fix (notes, not bugs):
- Checkbox indeterminate is unfilled in maia. It matches Radix.
- Toast `toasts$` is async and coalesced; `provideIvToast` checks for a manual container once. Both documented.
- Raw HTML in markdown prose is trusted (repo-authored). `api.test` argument capture stops at the first `)`.

**Check:** each fix gets a spec or test that failed before. `npm run check`.

### T7. Release 1.1.0
1. `npx changeset version` → 1.1.0 for both packages, CHANGELOG entry.
2. `npm run check`, `npm run smoke:pack`, `npm run smoke:cli`.
3. PR `phase-8-components` → `main`. CI green. Merge.
4. Ask the user. Run the Release workflow on `main`.

**Exit gate:**
- Every new component is in the docs index, the registry and the module smoke app.
- `npm run check` green. 1.1.0 of both packages on npm with provenance.

---

## Phase 9 — Release 1.2.0: Playground (themes, colors, fonts)
Branch `phase-9-playground`. Outline: expand into tasks and get an OK first.

**Goal:** pick a style, base color, font and radius on one page, see real components change live, then install that exact look with one command.

Today: presets are data `{ style, baseColor, font, radius }` with share code `ivp1_…` (`projects/cli/src/preset.ts`). Only `neutral`, `system` and `default` exist (`tools/registry/build.ts:136-140`). `ivorie init` stores font and radius but does not apply them (`projects/cli/src/commands/init.ts:64-73`).

Scope:
1. **Base colors as data:** `tools/registry/base-colors/<name>.json` for shadcn's 7: neutral, stone, zinc, mauve, olive, mist, taupe (source `.ref/shadcn/apps/v4/registry/base-colors.ts`). The registry index lists them.
2. **Fonts:** `--font-sans` and `--font-heading` tokens. Options from shadcn `.ref/shadcn/apps/v4/registry/fonts.ts`. The CLI writes the token and prints how to load the font.
3. **Radius:** options none, small, default, large, full, mapped to `--radius`. The CLI applies it.
4. **CLI `ivorie apply <preset|ivp1_…>`:** change the look of an existing app. Rewrites `theme.css`, the style file, the body class and `components.json`.
5. **Docs `/playground`** (new top bar tab):
   - Controls: style, base color, font, radius, light/dark.
   - Live preview: a wall of real components (cards, forms, table, dialogs).
   - Output: share code, `npx ivorie init --preset ivp1_…`, `npx ivorie apply ivp1_…`, copyable CSS.
   - Reuse `apps/docs/src/app/shell/appearance.ts` (style class swap, lazy style links).
   - Use the frontend-design skill.

**Exit gate:**
- A preset made in the Playground, installed with `ivorie init --preset` in a fresh app, gives the same look (extend `smoke:cli`).
- `npm run check` green. 1.2.0 on npm.

---

## Phase 10 — Release 1.3.0: Blocks
Branch `phase-10-blocks`. Outline: expand into tasks and get an OK first.

**Goal:** ready-made page sections (login, signup, sidebar layouts) users add with one command and then own.

Today: the registry has no block kind (`projects/cli/src/registry.ts:7`). `add` already writes multi-file items and resolves `registryDependencies` (`projects/cli/src/commands/add.ts:64-69`).

Scope:
1. **Registry:** new `ItemKind` `block`. Files go to `<path>/blocks/<name>/`. `add --all` still adds components only (`add.ts:60`).
2. **Source:** blocks live in the repo (folder decided at expand time), built and tested like the docs app.
3. **Docs `/blocks`** (new top bar tab): full-width preview, desktop/tablet/mobile width toggle, file tree + code, `npx ivorie add <block>`. Use the frontend-design skill.
4. **First set** (port from `.ref/shadcn/apps/v4/registry/bases/radix/blocks/`): login-01…05, signup-01…05, sidebar-01…08. `dashboard-01` waits for charts (Phase 12).

**Exit gate:**
- `ivorie add login-01` in a fresh app builds and renders (extend `smoke:cli`).
- `npm run check` green. 1.3.0 on npm.

---

## Phase 11 — Release 1.4.0: Icon libraries as plugins
Branch `phase-11-icons`. Outline: expand into tasks and get an OK first.

**Goal:** choose lucide, tabler, phosphor, hugeicons or remix like a theme. Smaller docs bundle.

Today: 14 component files import `@lucide/angular` directly (~17 icons: chevron-down, check, x, …). Each lucide icon is a full component (~3 kB compiled); the docs initial chunk holds ~112 kB of icons.

Scope:
1. **Semantic icon set:** one name per icon the components use (`chevron-down`, `check`, `x`, …).
2. **`IvIcon`** (`<svg ivIcon="chevron-down">`) + `provideIvIcons(map)`. One map per library: `@inlaylab/ivorie/icons/lucide`, `/tabler`, `/phosphor`, `/hugeicons`, `/remix`. Lucide is the default. No API change for package users.
3. **Components:** replace the direct `@lucide/angular` imports in the 14 files with `IvIcon`.
4. **CLI:** `iconLibrary` enum in `projects/cli/schema/components.schema.json:22`; `ivorie init --icon-library <lib>`; rewrite icon imports at `add.ts:68` after `rewritePrefix`; dependencies from the chosen library (`init.ts:28`). Reference: shadcn `packages/shadcn/src/migrations/migrate-icons.ts`, `apps/v4/registry/icons/`.
5. **Playground:** icon library picker.
6. **Dependencies:** icon libraries become optional peers.

**Exit gate:**
- Every library renders every component icon (spec per library).
- Docs initial bundle under 700 kB.
- `npm run check` green. 1.4.0 on npm.

---

## Phase 12 — Release 1.5.0: Charts
Branch `phase-12-charts`. Outline: expand into tasks and get an OK first.

**Goal:** line, area, bar and pie charts that follow the theme, like shadcn charts.

Scope:
1. **Engine decision** at phase start (DECISIONS line). Recommended: SVG built with `d3-scale` + `d3-shape`. It is small, renders on the server and themes with CSS vars. Alternatives: ECharts, Chart.js (canvas, no SSR output).
2. **`@inlaylab/ivorie/chart`:** `IvChartContainer` with a config that maps series to `--color-<key>` CSS vars (like shadcn `ChartContainer`), tooltip, legend.
3. **Charts:** line, area, bar, pie (+ donut).
4. **Docs:** examples ported from a subset of `.ref/shadcn/apps/v4/registry/new-york-v4/charts/`.
5. **Block `dashboard-01`** (from Phase 10).

**Exit gate:**
- Charts render in SSR and hydrate with no warnings. Axe clean.
- `npm run check` green. 1.5.0 on npm.

---

## Any time
- **Angular 23** (due about Nov 2026): watch the `angular-next` CI job. Then `ng update`, `npm run check`, raise the peer range. See [COMPAT](docs/COMPAT.md). Lands in whichever phase is open.

## Backlog (not scheduled)
- Playwright visual regression tests.
- Docs search and versioned docs.
- CLI: `ivorie list`, `ivorie diff`, custom third-party registries, interactive component picker.
- AI chat components from shadcn: attachment, bubble, marker, message, message-scroller, questionnaire, trace, code-block.
- `direction`: not needed, `@angular/cdk/bidi` `Dir` covers it.

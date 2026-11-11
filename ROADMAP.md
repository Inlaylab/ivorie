# Ivorie — Roadmap

Single source for plan, status and next work. Updated 2026-11-11.

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

**Next:** Phase 15 (1.5.0, charts and dashboards), branch `feat/charts` (from the 1.4.1 release commit). Tasks T1–T10 written below; T1 done (entry, config, container). Next: T2.
Phase 16 (1.4.1): exit gate green. Left: PR, merge, tag `v1.4.1`, publish (ask first). `feat/charts` rebases onto `main` after that.
Phase 17 (docs redesign): no own release; it lands later, with whichever release is open. Phase 18 (glass material and dials) moves to 1.6.0.
Shipped: 1.0.0, 1.1.0, 1.2.0, 1.4.0 (both packages; 1.3.0 never published, its icon libraries shipped in 1.4.0). Tag `v1.4.0` is missing on the remote. Docs initial bundle is ~800 kB, mostly lucide icons (backlog: docs drop `@lucide/angular`).

| #   | Release | What                                      | Status   |
| --- | ------- | ----------------------------------------- | -------- |
| 8   | 1.1.0   | Components + quick wins                   | done     |
| 9   | 1.2.0   | Playground: themes, colors, fonts         | done     |
| 11  | 1.3.0   | Icon libraries as plugins                 | in 1.4   |
| 10  | 1.4.0   | Styles, data table, blocks                | done     |
| 16  | 1.4.1   | Fix: radius and font follow the pick      | publish  |
| 15  | 1.5.0   | Charts and dashboard blocks               | next     |
| 18  | 1.6.0   | Glass material and new dials              | planned  |
| 14  | 1.7.0   | AI-ready: AGENTS.md and MCP server        | planned  |
| 17  | —       | Docs redesign: Home, Playground, Blocks   | later    |

Order is by benefit to users; features come first. New features ship as minor releases (1.x.0). A patch (1.x.y) is for bug fixes only.

## Must do (now)

Owner in brackets. Items marked "user" need a person, not code.

1. **[user] Confirm 1.0.0 on npm:** `npm view @inlaylab/ivorie version` and `npm view ivorie version` both print `1.0.0`.
2. **[user] Trusted Publisher:** on npmjs.com, for each package: Settings → Trusted Publisher → GitHub Actions, repo `Inlaylab/ivorie`, workflow `release.yml`. Then Phase 8 T0 drops `NPM_TOKEN`.
3. **[user] Trademark and company legal OK** for the name, if still open.

## How we work

- One phase = one minor release = one branch = one PR into `main`.
- Versions follow SemVer 2.0: a new feature is a minor (1.x.0), a bug fix is a patch (1.x.y), a breaking change is a major (x.0.0). Both packages share one version (Changesets `fixed`).
- Branches: `feat/<short-name>` for a phase, `fix/<short-name>` for a patch, `chore/<short-name>` for tooling or docs only. Lowercase, hyphens, no version in the name. Branch from `main`.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`; `!` or `BREAKING CHANGE:` for a major).
- One release = one commit. Finish a task, run its check, update **Status** here; no commit between tasks.
- Release: after the exit gate, `npx changeset version`, then the single commit `<type>: release X.Y.Z — <summary>`. After merge, tag `main` as `vX.Y.Z` and publish from that tag.
- A phase marked "outline" is expanded into tasks (superpowers:writing-plans) and OK'd before work starts.
- A phase is done only when its exit gate passes. Run the commands and show the output.
- **Publishing is public and cannot be undone. Ask the user before every publish.**
- New components follow the "Add a component" checklist in [CONVENTIONS](docs/CONVENTIONS.md). Blocks live in `projects/blocks/<name>/` (page `<name>.ts` with `export const meta`, `components/`, optional `data.ts`, spec).
- Docs site UI work: use the frontend-design skill.
- A new big choice gets one line in [DECISIONS.md](docs/DECISIONS.md).
- No AI attribution lines in commits or PRs.
- Docs stay short and plain.

| What                       | Command                             |
| -------------------------- | ----------------------------------- |
| Build library              | `npx ng build ui`                   |
| Unit tests                 | `npx ng test ui --watch=false`      |
| Block tests                | `npx ng test blocks --watch=false`  |
| Some gates only            | `npm run check -- --only <name>,…`  |
| Docs app                   | `npm start` (http://localhost:4200) |
| All gates (no network)     | `npm run check`                     |
| Package smoke              | `npm run smoke:pack`                |
| CLI smoke (network)        | `npm run smoke:cli`                 |
| Static docs                | `npm run docs:build`                |
| Manual publish (ask first) | `npm run publish:all`               |

`npm run check` runs these steps:

- build-ui, test-tools, publint, attw, test-ui, test-blocks
- test-cli, build-registry, build-cli, test-cli-bin, publint-cli
- build-docs, smoke-ssr, test-docs, build-module-smoke, test-module-smoke

It also runs these grep rules:

- no-ui-prefix, no-root-import, no-relative-cross-import, no-lib-readme
- no-input-decorator, no-deprecated-api, no-dom-globals

---

## Phase 8 — Release 1.1.0: Components + quick wins

Branch `v1.1.0`. Tasks are OK'd.

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
3. PR → `main`. CI green. Merge.
4. Ask the user. Run the Release workflow on `main`.

**Exit gate:**

- Every new component is in the docs index, the registry and the module smoke app.
- `npm run check` green. 1.1.0 of both packages on npm with provenance.

---

## Phase 9 — Release 1.2.0: Playground (themes, colors, fonts)

Branch `phase-9-playground` (made before the naming rule). Tasks are OK'd.

**Goal:** pick a style, base color, font and radius on one page, see real components change live, then install that exact look with one command.

Today: presets are data `{ style, baseColor, font, radius }` with share code `ivp1_…` (`projects/cli/src/preset.ts`). Only `neutral`, `system` and `default` exist (`tools/registry/build.ts:136-140`). `ivorie init` stores font and radius but does not apply them (`projects/cli/src/commands/init.ts:64-73`).

Scope:

1. **Base colors as data:** `tools/registry/base-colors/<name>.json` for shadcn's 7: neutral, stone, zinc, mauve, olive, mist, taupe (source `.ref/shadcn/apps/v4/registry/base-colors.ts`). The registry index lists them.
2. **Fonts:** `--font-sans` and `--font-heading` tokens. Options from shadcn `.ref/shadcn/apps/v4/registry/fonts.ts`. The CLI writes the token and prints how to load the font.
3. **Radius:** options none, small, default, large, full, mapped to `--radius`. The CLI applies it.
4. **CLI `ivorie apply <preset|ivp1_…>`:** change the look of an existing app. Rewrites `theme.css`, the style file, the body class and `components.json`.
5. **Docs `/playground`** (new top bar tab):
   - Controls: style, base color, font, heading font, radius. Light/dark is the site toggle.
   - Live preview: a wall of real components (cards, forms, table, dialogs).
   - Output: share code, `npx ivorie init --preset ivp1_…`, `npx ivorie apply ivp1_…`, copyable CSS.
   - The look shows only on the preview box and its overlays, never on the site. The home hero has a small version.
   - Site: one light/dark button (no menu), always style maia; sidebar only on `/docs` pages.
   - Use the frontend-design skill.

Tasks:

- **T1** Base colors as data: 7 JSON var maps, `theme-<name>` registry items.
- **T2** Fonts (27, `font-<name>` items), heading font (`fontHeading` in the preset, `.cn-font-heading`), radius map.
- **T3** CLI `renderLook`: one function renders the look; `init` applies font, heading font and radius.
- **T4** CLI `ivorie apply <preset|ivp1_…>`.
- **T5** Docs look data (generated) and playground state (page-only, URL `?preset=`).
- **T6** Docs `/playground` page: control rail, preview wall, copy commands and CSS.
- **T7** `smoke:cli` preset app, release 1.2.0.

**Exit gate:**

- A preset made in the Playground, installed with `ivorie init --preset` in a fresh app, gives the same look (extend `smoke:cli`).
- `npm run check` green. 1.2.0 on npm.

---

## Phase 11 — Release 1.3.0: Icon libraries as plugins

Branch `feat/icon-libraries`. Tasks are OK'd.

**Goal:** choose lucide, tabler, phosphor, hugeicons or remix like a theme. The preset picks it, the playground previews it, the CLI migrates app icons. Smaller docs bundle.

Design (simplified 2026-11-04, see DECISIONS):

- Components keep `<svg ivIcon>`. The set comes from `IV_ICONS` (lucide by default). `provideIvIcons(COMPONENT_ICONS)` switches it.
- Four entries `@inlaylab/ivorie/icons/{tabler,phosphor,hugeicons,remix}`: each holds only `COMPONENT_ICONS` (the 18 the components use), copied once from `@ng-icons/*`. No generator.
- App and docs icons use `<ng-icon>` from `@ng-icons/core` with the same library.
- `ivorie migrate icons --from lucide --to tabler [--path]` renames `@ng-icons` names in templates, `provideIcons` and imports, using `tools/icons/names.json` (185 shared icons). Unmapped icons are listed, left as is.

Tasks:

- **T1** `IvIcon`: `IconData`, `IV_ICONS`, `provideIvIcons`, static bindings. Old inputs keep working. Done.
- **T2** Four `icons/<lib>` entries with `COMPONENT_ICONS`, spec per library.
- **T3** CLI: `iconLibrary` preset key (left out when lucide), `init --icon-library`, `init` and `apply` write `provideIvIcons(COMPONENT_ICONS)` and install `@ng-icons/core` + the set.
- **T4** CLI `migrate icons --from --to [--path]`, with tests.
- **T5** Playground icon switch: an Icons picker in the look controls, `iconLibrary` in the share code, the preview draws component icons from the picked set. Use the frontend-design skill.
- **T6** `smoke:cli` tabler app, release 1.3.0.

**Exit gate:**

- Every library renders all 18 component icons (spec per library).
- `migrate icons` tests pass (lucide to tabler and back).
- `npm run check` green. 1.3.0 on npm.

---

## Phase 10 — Release 1.4.0: Styles, data table, blocks

Branch `feat/v1.4.0`. Tasks are OK'd. One commit per feature (T1–T3), then the release commit.

**Goal:** more than shadcn, zard and ng-primitives. New looks, a data table and ready-made blocks that work together: blocks use the data table, and every block and component follows every style. Fast to render, easy to add, easy to extend, easy to update.

### T1. Styles: glass, brutal, aurora, bento, mono

- Each new style is a small override file `tools/styles/own/<name>.css` with `/* @base <synced style> */`. `node tools/styles/derive.ts <name>|--all` writes `projects/ui/styles/style-<name>.css`: an own rule replaces the base rule for its hook. Re-derive after every style sync.
- Glass (on nova): frosted panes over a vivid color field, solid with no `backdrop-filter` or with reduced transparency. Brutal (on vega): ink frames, hard shadows, a loud accent. Aurora (on vega): gradient edges and glow. Bento (on maia): tonal tiles, no outlines. Mono (on nova): monospace, square, flat.
- A test makes every own style (except shape-only mono) style each look-bearing hook, so none ships half done.
- Registry, `ivorie init --style` and `ivorie apply` pick them up. The playground lists them.
- The playground preview moves into a same-origin iframe (`/preview/scene/<name>`), so no site style leaks in. Width toggle: desktop, tablet, mobile.
- **Check:** every style compiles with Tailwind; text contrast ≥ 4.5 on (translucent) surfaces for every base color, light and dark. `npm run check`.

### T2. Data table: sort, pagination, filter, selection

- New entry `@inlaylab/ivorie/data-table`. `table` stays markup only.
- `ivDataTable()` returns signals state: sorting, pagination, filter, row selection, column visibility. Client mode filters, sorts and pages in separate `computed`s. Server mode skips that and exposes one `query()` signal for `httpResource`. Same API for both.
- Parts: sort header (`aria-sort`), pagination (page size, first/prev/next/last, "Page X of Y"), view options (column visibility), select-all and row checkboxes, loading and empty rows. Cells stay in the user's template.
- **Check:** sort, page, filter and select specs (Vitest + axe). SSR renders the first page. `npm run check`.

### T3. Blocks: login, signup, sidebar, dashboard

- 19 blocks in `projects/blocks/<name>/`: login-01…05, signup-01…05, sidebar-01…08, dashboard-01 (sidebar shell, stat cards, data table; chart slot waits for Phase 15).
- Wired, not just markup: reactive forms with validation, typed outputs (`submitted`, `provider`), `pending` and `error` inputs. Sidebar data in an editable `data.ts`.
- Registry kind `block`. `ivorie add login-01` writes `src/app/blocks/login-01/`, adds missing components, rewrites imports to the local copies, and renames icons to the app's icon library. `add --all` stays components only.
- Docs `/blocks`: index grid, block page with an iframe preview, width toggle, style and color picker, file tree + code, install command.
- **Check:** `npx ng test blocks --watch=false`, CLI tests, `npm run check`, `npm run smoke:cli`.

### T4. Release 1.4.0

1. `npx changeset version` → 1.4.0 for both packages, CHANGELOG entry.
2. `npm run check`, `npm run smoke:pack`, `npm run smoke:cli`.
3. PR → `main`. CI green. Merge. Tag `v1.4.0`.
4. Ask the user. Run the Release workflow.

**Exit gate:**

- `ivorie add login-01` in a fresh app builds and renders, also in a tabler app (extend `smoke:cli`).
- Data table sort, page, filter and select specs pass with axe. SSR renders the first page.
- Every component compiles in every new style. Contrast clean in light and dark.
- `npm run check` green. 1.4.0 on npm.

---

## Phase 16 — Release 1.4.1: Radius and font follow the pick

Branch `fix/look-tokens`. Tasks are OK'd. One commit.

**Goal:** a picked radius and font reach every component in every style, Mono included: Playground preview (and overlays), CLI output, package apps.

- **T1** Radius scale: `theme.css` re-declares `--radius-sm`…`--radius-4xl` on `:where([class*="style-"])`, so a `--radius` set below `:root` (Playground target, style class) reaches the `var(--radius-*)` uses in style files.
- **T2** Mono follows the theme like every style: no forced radius 0 or `--font-mono`. The Playground picks Geist Mono when you switch to Mono, and drops it when you leave. A third font slot is parked: backlog.
- **T3** Rhea keeps upstream's 24px cap on cards and dialogs (no change).
- **T4** Specs (playground look, theme structure, mono derive) and a browser matrix: 10 styles × radius × font.

**Exit gate:** `npm run check`, `npm run smoke:pack`, `npm run smoke:cli` green; browser matrix in the PR. 1.4.1 on npm (ask first).

---

## Phase 17 — Docs redesign (Home, Playground, Blocks), no own release

Work sits on `release/v1.4.1` for now. It lands later, with whichever release is open (2026-11-11). Docs only: no change in `projects/ui`, `projects/cli` or `projects/blocks`. Use the frontend-design skill. Direction picked 2026-11-11: smoky glass.

Rule for every task: the site material styles the site chrome only. Previews (home wall, playground iframe, block iframes, demo frames) keep the picked look and never inherit site panes, radials or blur.

### T1. Site material (smoky glass, dark-first)

- Tokens in `apps/docs/src/styles.css`, light and dark, site only: ground `#0E0F13` / `#F3F3F5`, pane (white 4% / white 70%), 1px rim highlight, layered shadow stack, faint background radials, brand violet (logo dot, badges, focus only), `--docs-ease: 220ms ease-out`.
- Utilities: `.docs-pane` (fill + border + rim + shadow), `.docs-backdrop` (radials, `aria-hidden`, no pointer events). Blur only where text sits on moving content (header); solid fallback under `prefers-reduced-transparency`.
- Dark-first: with no saved choice the site opens dark. Boot script in `index.html`, `Appearance` default, server render (`<html class="dark">`) all agree, so no flash and clean hydration. The toggle still saves light.
- Header: glass bar on the new tokens. Docs pages: sidebar and content on the ground, code blocks and tables as panes.
- **Check:** `appearance.spec.ts` (default dark, saved light wins), contrast ≥ 4.5 for body and muted text on ground and pane in both modes (spec over the token values), `npm run check -- --only build-docs,test-docs,smoke-ssr`.

### T2. Home

- Announcement pill: latest release, links to `/roadmap`.
- Hero: H1, one line, two CTAs (Get started, Open the playground), install tabs (Package / Copy the source) with copy.
- Wall of live cards: real components, 15 cards (the old Dashboard, Sign in, Settings, Team and Checkout scenes merged in). Columns 4/3/2/1 at 1440/1024/768/390, bottom fade, "Browse all components" over it.
- Inline style switcher above the wall: one pill per style. It re-skins only the wall and its overlays (`PlaygroundLook.attach`). No preset command or copy button on Home (changed 2026-11-11). Replaces today's side rail.
- Package vs source: two short panes. Then the footer.
- The wall cards live in one component, reused by T3's Wall scene.
- **Check:** `home.spec.ts` (switcher changes only the wall, command follows, axe clean), SSR renders the wall.

### T3. Playground

- Left panel: compact rows, each a label and a dropdown: style, base color, radius, icons, font, heading font. Fits 900px tall with no scroll.
- Stage: big iframe preview of the Wall, the only scene (Dashboard, Sign in, Settings, Team and Checkout merged into it, scene tabs removed, 2026-11-11). Widths desktop/tablet/mobile.
- Bottom bar: Copy link (URL with `preset`), Shuffle (random style, color, radius, fonts; not icons), Get code (one dialog: New app / Existing app command, preset code, CSS).
- Mobile: the controls open in a sheet; the bottom bar stays.
- Prerendered route `/preview/scene/wall` replaces `/preview/scene/dashboard` in `tools/smoke/ssr.ts`.
- **Check:** `playground.spec.ts` (Shuffle changes the code and URL, Get code shows the right command, Copy link copies the URL, axe clean), `npm run check -- --only build-docs,test-docs,smoke-ssr`.

### T4. Blocks

- `/blocks`: category tabs Featured, Login, Sign up, Sidebar, Dashboard; the tab is in the URL (`?category=`). Featured: login-01, signup-01, sidebar-01, dashboard-01.
- Each block a full-width section: title, one line, toolbar (Preview/Code, widths, open in a new tab, reload, copy `npx ivorie add <name>`), preview iframe loaded on viewport (`@defer`), Code shows the file tree and source.
- `/blocks/:name` stays for deep links and the inputs/outputs table, on the new material.
- **Check:** `blocks.spec.ts` and `block.spec.ts` (tabs filter, toolbar actions, axe clean), SSR smoke still renders every block page.

### T5. Review and gate

- Impeccable detector on changed files; fix what it finds.
- Browser review light and dark at 390, 768, 1440: Home, Playground, Blocks, one docs page. Screenshots in the PR.
- Lighthouse a11y ≥ 95 on Home, Playground, Blocks.

**Exit gate:** `npm run check`, `npm run docs:build`, browser review light/dark at 390/768/1440, Lighthouse a11y ≥ 95.

---

## Phase 18 — Release 1.6.0: Glass material and new dials

Branch `feat/glass-material`. Outline: expand into tasks and get an OK first.

- **Glass style rework** (`tools/styles/own/glass.css`): thickness ladder, rim/edge shadow stack, blur tokens, ink-pane primary button, float-in motion. Credit solid-glass (MIT) in NOTICE.md.
- **New dials:** accent, chart color, density; glass-only thickness, rim, shadow, blur; Shuffle. Dials a style ignores are disabled.
- **Preset v2** `ivp2_` (reads `ivp1_`), CLI `init --preset` / `apply`, only tuned variables emitted.

**Exit gate:** preset v1/v2 round-trip, CLI look specs, contrast test, `smoke:cli` parity, `npm run check`. 1.6.0 on npm.

---

## Phase 14 — Release 1.7.0: AI-ready (AGENTS.md and MCP server)

Branch `feat/ai-ready`. Outline: expand into tasks and get an OK first.

**Goal:** AI coding agents use Ivorie the right way: right imports, right selectors, components added with the CLI.

Scope:

1. **AGENTS.md:** a short guide for apps that use Ivorie. `ivorie init` writes it (or adds a section to an existing one).
2. **llms.txt:** the docs site publishes `llms.txt` with every page in plain text.
3. **MCP server:** agents browse the registry, read a component's docs and run `add`. Reference: shadcn `packages/shadcn/src/mcp/`. The docs page `/docs/mcp` says coming soon until then.

**Exit gate:**

- An MCP client lists and adds a component in a fresh app (extend `smoke:cli`).
- `npm run check` green. 1.7.0 on npm.

---

## Phase 15 — Release 1.5.0: Charts and dashboard blocks

Branch `feat/charts`. Tasks written 2026-11-11, waiting for the OK. Step-by-step plan (local): `docs/superpowers/plans/2026-11-11-charts.md`.

**Goal:** dashboards built from Ivorie alone. Six chart types that feel like shadcn's, a 70-example gallery and four dashboard blocks.

**Engine:** SVG parts on `d3-scale` + `d3-shape`, shadcn/Recharts model (DECISIONS 2026-11-11). Same Recharts prop names, so shadcn examples port line by line.

### T1. Entry, deps, config, container
- `@inlaylab/ivorie/chart`: `IvChart` (`iv-chart`), `IvChartConfig` (`label`, `icon` = any component, `color` or `theme: { light, dark }`), `--color-<key>` vars, scoped `<style>` for themes.
- SSR at `initialDimension` (320 × 200), then `ResizeObserver` after render; width 0 keeps the last size.
- Deps `d3-scale`, `d3-shape`. Style hooks `cn-chart`, `cn-chart-tooltip` synced. Counts, module smoke, registry deps.

### T2. Cartesian core: line and area
- Roots `svg[ivLineChart]`, `svg[ivAreaChart]`; `ivXAxis`, `ivYAxis`, `ivCartesianGrid`, `ivLine`, `ivArea` (curves, dots, stack, `expand`).
- Empty data and missing values: no `NaN`, gaps in lines. `role="img"` + `aria-label`.

### T3. Bar and label list
- `svg[ivBarChart]` (horizontal, vertical), `ivBar` (stack, radius, per-row fill, negative values), `ivLabelList`.

### T4. Polar: pie, radar, radial
- `svg[ivPieChart]`, `svg[ivRadarChart]`, `svg[ivRadialChart]`; `ivPie` (donut, several rings), `ivPolarGrid`, `ivPolarAngleAxis`, `ivPolarRadiusAxis`, `ivRadar`, `ivRadialBar`.
- Center text with `ng-template[ivChartLabel]`; `ivArc()` helper.

### T5. Interaction
- `iv-chart-tooltip` (indicator dot/line/dashed, hide label/indicator, formatters, `defaultIndex`, custom body), `iv-chart-legend`, cursor.
- Keyboard: one tab stop, arrows move, Home/End, Escape. `activeIndex` from outside, `ng-template[ivActiveShape]`. Shrinking data clears the active point.

### T6. Motion, own-style tooltips, size budget
- Short CSS entrance, off under reduced motion.
- Glass, brutal, aurora, bento, mono restyle `cn-chart-tooltip`; `chart-tooltip` joins `LOOK_HOOKS`.
- New check `size-chart`: chart entry + d3 under 30 kB gzipped.

### T7. Docs: chart page and cartesian gallery
- `chart.md` (first chart step by step, config, theming, tooltip, legend, a11y, API).
- New docs section `charts`; pages area, bar, line with all 30 shadcn examples.

### T8. Docs: pie, radar, radial, tooltip gallery
- Pages pie (11), radar (14), radial (6), tooltip (9). Gallery total 70. Checked by eye against shadcn, light and dark.

### T9. Dashboard blocks
- `dashboard-01`: the slot becomes the interactive area chart (90 / 30 / 7 days).
- New: `dashboard-02` Analytics, `dashboard-03` Sales, `dashboard-04` Product usage. Each self-contained with spec. Blocks count 19 → 22.

### T10. Release 1.5.0
- Rebase on `main` once 1.4.1 has merged (ask before force-push). ARCHITECTURE line, changeset, CHANGELOG, one commit `feat: release 1.5.0 — charts and dashboard blocks`.

**Exit gate:**

- `npm run check` green (with `size-chart`), `smoke:pack`, `smoke:cli`. Charts render on the server and hydrate with no warnings (smoke-ssr). Axe clean.
- 1.5.0 on npm (ask first).

---

## Any time

- **Angular 23** (due about Nov 2026): watch the `angular-next` CI job. Then `ng update`, `npm run check`, raise the peer range. See [COMPAT](docs/COMPAT.md). Lands in whichever phase is open.

## Backlog (not scheduled)

- Docs drop `@lucide/angular` (initial bundle ~800 kB). Blocked on `<ng-icon>` sizing: its unlayered host styles beat Tailwind `size-*`, and its `@layer ng-icon` color beats `text-*`. Needs a small CSS shim first. Also: playground scene icons follow the icon library.
- Mono fonts: a third font slot `--font-mono` (preset `fontMono`, CLI `--font-mono`, playground picker, more mono fonts). Mono reads it; titles too.
- Playwright visual regression tests.
- Docs search and versioned docs.
- CLI: `ivorie list`, `ivorie diff`, custom third-party registries, interactive component picker.
- AI chat components from shadcn: attachment, bubble, marker, message, message-scroller, questionnaire, trace, code-block.
- `direction`: not needed, `@angular/cdk/bidi` `Dir` covers it.

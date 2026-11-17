# Ivorie — Plan

The why behind the work. Status and tasks live in [ROADMAP.md](../ROADMAP.md).

## Goal

Ship Angular components with the shadcn/ui look and behavior as an open-source library.

- npm package `@inlaylab/ivorie`: works in standalone, NgModule, SSR and zoneless apps. Built for the latest versions. See [COMPAT.md](COMPAT.md).
- CLI `ivorie`: copies component and block source into your app, like shadcn.
- One source of truth: the library source. The CLI copies from it.

## Fixed decisions

- Brand **Ivorie**. Selector prefix `iv-`, attribute prefix `ivX`, class names `IvX`.
- Signals API. Tailwind v4 required.
- Look and behavior follow shadcn/ui: radix base plus style files.
- More: [DECISIONS.md](DECISIONS.md).

## How phases work

- Each phase ends with an exit gate. No next phase until the gate is green.
- Phases 1–7 built 1.0.0. From Phase 8 on, one phase = one minor release.
- An outline phase is expanded into tasks right before it starts. Plans made early go stale.
- Release order is by user benefit: components, then playground, icons, styles and blocks, then charts. Small releases ship sooner.

## Key choices

1. **Docs app from day 1, with SSR.** `apps/docs` is also the playground, so SSR bugs show up early.
2. **One rename map** (`tools/rename/rename-map.json`). The rename used it; `ivorie migrate` reuses it.
3. **`npm run check` runs every gate:** builds, tests, grep rules, SSR smoke. Pass or fail, no log reading.
4. **shadcn registry format** for the CLI, so `npx shadcn add` also works.
5. **Latest versions:** Angular 22, Vitest, zoneless.
6. **Harden before publish.** Fixes that change what users see go in before a release, not after.
7. **One feature = one minor release.** Patches (1.x.y) are bug fixes only.

## Working with Claude

- New session per phase. ROADMAP.md carries the state.
- Start prompt: `Continue the plan. Read CLAUDE.md and do the next open task.`
- Claude reads CLAUDE.md, then ROADMAP.md (Status, Must do, the current phase). Not the whole repo.
- Long outputs (build, tests): read only the errors. `npm run check` prints a short summary.

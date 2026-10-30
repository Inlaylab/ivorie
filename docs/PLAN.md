# Ivorie — Plan

The why and the shape of the work. Status and task lists live in [ROADMAP.md](../ROADMAP.md).

## Goal
Publish the admin portal UI components as an open-source Angular library.
- npm package `@ivorie/ui`: works in standalone, NgModule, SSR and zoneless apps. Built for the latest versions: Angular 22, Tailwind 4.3. See [COMPAT.md](COMPAT.md).
- CLI `ivorie`: copies component source into your app, like shadcn.
- One source of truth: the library source. The CLI copies from it.

## Fixed decisions
- Brand **Ivorie**. Selector prefix `iv-`, attribute prefix `ivX`, class names `IvX`.
- Signals API from v1.0. Tailwind v4 is required.
- Look and behavior follow shadcn/ui (radix base + style files, maia first).
- New repo only. The admin portal is read-only for us.
- More decisions: [DECISIONS.md](DECISIONS.md).

## Phases
Each phase ends with an exit gate. No next phase until the gate is green.

| # | Phase | What | Gate (short) | Status |
|---|---|---|---|---|
| 7 | Release v1.0 | OSS files, Changesets, provenance publish | both packages on npm | next (outline) |
| — | v1.x | Theme builder + Playground, icon library plugins, more components, visual tests | — | backlog |

Details per phase: [ROADMAP.md](../ROADMAP.md). An outline phase is expanded into tasks right before it starts (plans made early go stale).

## Key choices that shaped the plan
1. **Docs app from day 1, with SSR.** The playground is `apps/docs`. SSR bugs show up early.
2. **Angular schematics did the boring part of Phase 4** (inject, signal inputs, outputs, queries). Hand work only for `model()`, `computed()` and fixes.
3. **Phase 4 in 5 batches** (leaf, form, overlay, layout, extras). One batch = one PR.
4. **One rename map** (`tools/rename/rename-map.json`). Phase 2 used it; `ivorie migrate` reuses it.
5. **`npm run check` runs every gate** (builds, tests, grep rules, SSR smoke). Pass or fail, no log reading.
6. **shadcn registry format** for the CLI, so `npx shadcn add` also works.
7. **Latest versions.** Angular 22, Vitest, zoneless, `@lucide/angular`.
8. **Harden before publish.** Fixes that change behavior users see go in before v1.0, not after.
9. **Cut to v1.x:** preset themes, theme builder, visual regression tests, missing shadcn components.

## How to work with Claude (fast, low tokens)
- New session per phase (or per batch). ROADMAP.md carries state.
- Start prompt: `Continue the plan. Read CLAUDE.md and do the next open task.`
- Claude reads only: CLAUDE.md → ROADMAP.md (Status, Must do, the current phase under Pending). Not the whole repo.
- Parallel work: one subagent per component, then one review per batch.
- Long outputs (build, tests): read only the errors. `npm run check` prints a short summary.

# Ivorie — Plan

The why and the shape of the work. Status and task lists live in [ROADMAP.md](../ROADMAP.md).

## Goal
Ship Angular components with the shadcn/ui look and behavior as an open-source library.
- npm package `@inlaylab/ivorie`: works in standalone, NgModule, SSR and zoneless apps. Built for the latest versions: Angular 22, Tailwind 4.3. See [COMPAT.md](COMPAT.md).
- CLI `ivorie`: copies component source into your app, like shadcn.
- One source of truth: the library source. The CLI copies from it.

## Fixed decisions
- Brand **Ivorie**. Selector prefix `iv-`, attribute prefix `ivX`, class names `IvX`.
- Signals API from v1.0. Tailwind v4 is required.
- Look and behavior follow shadcn/ui (radix base + style files, maia first).
- More decisions: [DECISIONS.md](DECISIONS.md).

## Phases
Each phase ends with an exit gate. No next phase until the gate is green.

Phases 1–7 built and shipped 1.0.0. From Phase 8 on, one phase = one minor release.

| # | Release | What | Gate (short) | Status |
|---|---|---|---|---|
| 8 | 1.1.0 | Components index, stacked examples, missing shadcn components, quick wins | new components in docs, registry, module smoke | next |
| 9 | 1.2.0 | Playground: base colors, fonts, radius, `ivorie apply` | Playground preset = same look after `ivorie init` | outline |
| 10 | 1.3.0 | Blocks: login, signup, sidebar | `ivorie add login-01` builds in a fresh app | outline |
| 11 | 1.4.0 | Icon libraries as plugins | every library renders every icon; docs bundle < 700 kB | outline |
| 12 | 1.5.0 | Charts: line, area, bar, pie | SSR + hydration clean | outline |

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
10. **Release order by user benefit** (2026-10-31): components first (what people come for), then Playground (most visible), Blocks, icon plugins, charts last (needs an engine choice).
11. **One feature = one minor release.** Small releases ship sooner. Patches (1.x.y) are bug fixes only.

## How to work with Claude (fast, low tokens)
- New session per phase (or per batch). ROADMAP.md carries state.
- Start prompt: `Continue the plan. Read CLAUDE.md and do the next open task.`
- Claude reads only: CLAUDE.md → ROADMAP.md (Status, Must do, the current phase under Pending). Not the whole repo.
- Parallel work: one subagent per component, then one review per batch.
- Long outputs (build, tests): read only the errors. `npm run check` prints a short summary.

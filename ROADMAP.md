# Ivorie — Roadmap

Plan, status and next work. Updated 2026-11-17.

## Goal

Ship the Ivorie Angular components as open source.

- **`@inlaylab/ivorie`**: the npm package. One entry point per component (`@inlaylab/ivorie/button`). Works in standalone, NgModule, SSR and zoneless apps.
- **`ivorie`**: a CLI that copies component and block source into an app, like shadcn.
- The library source is the single source of truth. The CLI copies from it.

Fixed choices:

- Brand **Ivorie**. Element selector `iv-x`, attribute `ivX`, class `IvX`.
- Signals API. Tailwind v4 required.
- Latest versions only: Angular 22, Tailwind 4.3, zoneless, Vitest.

Why and how: [PLAN](docs/PLAN.md) · [ARCHITECTURE](docs/ARCHITECTURE.md) · [CONVENTIONS](docs/CONVENTIONS.md) · [COMPAT](docs/COMPAT.md) · [DECISIONS](docs/DECISIONS.md) · [DEPLOY](docs/DEPLOY.md) · [CHANGELOG](CHANGELOG.md).

## Status

**Latest: 1.5.1**, both packages on npm. Nothing in progress.

**Next:** Phase 18 (1.6.0). It is an outline: expand it into tasks and get an OK first.

Open items:

- Post the launch drafts in [docs/LAUNCH.md](docs/LAUNCH.md).
- Tags: `v1.0.0`…`v1.5.1` are on GitHub. The old tags `1.1.0`…`1.5.1` (no `v`) remain because the GitHub releases point to them. Retarget each release to its `v` tag, then delete the old tags.

| Release | What                                  | Status  |
| ------- | ------------------------------------- | ------- |
| 1.0–1.5 | See [CHANGELOG](CHANGELOG.md)         | shipped |
| 1.6.0   | More theme dials: density, glass      | next    |
| 1.7.0   | AI-ready: AGENTS.md, llms.txt, MCP    | planned |

Order is by benefit to users: features first.

## Must do

Items marked "user" need a person, not code.

1. **[user] Trademark and company legal OK** for the name, if still open.

## How we work

The full rules are in [CLAUDE.md](CLAUDE.md). In short:

- One phase = one minor release = one branch = one PR into `main`. A patch (1.x.y) is for bug fixes only.
- One release = one commit: `<type>: release X.Y.Z — <summary>`. No commits between tasks.
- Finish a task, run its check, update **Status** here.
- A phase is done when its exit gate passes. Run the commands and show the output.
- Release: exit gate → `npx changeset version` → release commit → PR → merge → tag `main` → publish.
- **Publishing is public and cannot be undone. Ask before every publish.**

---

## Phase 18 — Release 1.6.0: More theme dials

Branch `feat/theme-dials`. **Outline:** expand into tasks and get an OK first.

- **New dials:** density; glass-only thickness, rim, shadow and blur; float-in motion.
- A dial the current style ignores is disabled.
- New preset fields stay optional keys in `ivp1_` (DECISIONS 2026-11-13).
- Already done in 1.5.0: glass rework, accent and chart-color dials.

**Exit gate:** preset v1/v2 round-trip, CLI look specs, contrast test, `smoke:cli` parity, `npm run check`. 1.6.0 on npm (ask first).

---

## Phase 14 — Release 1.7.0: AI-ready

Branch `feat/ai-ready`. **Outline:** expand into tasks and get an OK first.

**Goal:** AI coding agents use Ivorie the right way: right imports, right selectors, components added with the CLI.

1. **AGENTS.md:** a short guide for apps that use Ivorie. `ivorie init` writes it, or adds a section to an existing one.
2. **llms.txt:** the docs site publishes `llms.txt` with every page in plain text.
3. **MCP server:** agents browse the registry, read a component's docs and run `add`. Reference: shadcn `packages/shadcn/src/mcp/`. Until then, `/docs/mcp` says "coming soon".

**Exit gate:** an MCP client lists and adds a component in a fresh app (extend `smoke:cli`). `npm run check` green. 1.7.0 on npm (ask first).

---

## Any time

- **Angular 23** (due about Nov 2026): watch the `angular-next` CI job. Then `ng update`, `npm run check`, raise the peer range. See [COMPAT](docs/COMPAT.md). Lands in whichever phase is open.

## Backlog

Not scheduled.

- **Docs bundle:** drop `@lucide/angular` from the docs (initial bundle ~800 kB). Blocked on `<ng-icon>` sizing: its unlayered host styles beat Tailwind `size-*`, and its `@layer ng-icon` color beats `text-*`. Needs a small CSS shim first. Then playground scene icons follow the icon library.
- **Mono font slot:** `--font-mono` (preset `fontMono`, CLI `--font-mono`, playground picker, more mono fonts). Mono and its titles read it.
- **Tests:** Playwright visual regression.
- **Docs:** search, versioned docs.
- **CLI:** `ivorie list`, `ivorie diff`, third-party registries, interactive picker.
- **AI chat components** from shadcn: attachment, bubble, marker, message, message-scroller, questionnaire, trace, code-block.
- Not needed: `direction` (`@angular/cdk/bidi` `Dir` covers it).

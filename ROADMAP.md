# Roadmap

Upcoming releases and work not done yet. Shipped work lives in the [CHANGELOG](CHANGELOG.md) and git history. Updated 2026-11-27. The why: [PLAN](docs/PLAN.md). Rules: [CLAUDE.md](CLAUDE.md).

## Status

Latest on npm: 1.6.0. Next:

1. **1.7.0:** expand Phase 14 into tasks and get an OK.

Open items:

- `[user]` Trademark and company legal OK for the name, if still open.
- Post the launch drafts in [docs/LAUNCH.md](docs/LAUNCH.md).
- Tags: retarget the GitHub releases from the old tags `1.1.0` to `1.5.1` (no `v`) to their `v` tags, then delete the old tags.
- Watch: the docs first load is 896 kB of its 900 kB budget. The next large addition to it fails `build-docs`: trim it (see Backlog) or raise the budget on purpose.

## Releases

| Release | What | Status |
|---|---|---|
| 1.7.0 | AI-ready: AGENTS.md, llms.txt, MCP server | planned |
| 2.0.0 | New themes; legacy themes and 1.5 aliases removed; carousel gutter after each slide | planned |

Order is by benefit to users: features first.

## 1.7.0: AI-ready (Phase 14)

Branch `feat/ai-ready`. Outline only: expand into tasks and get an OK before building.

Goal: AI coding agents use Ivorie correctly, with the right imports and selectors, and add components with the CLI.

1. **AGENTS.md:** a short guide for apps that use Ivorie. `ivorie init` writes it, or adds a section to an existing one.
2. **llms.txt:** the docs site publishes `llms.txt` with every page as plain text.
3. **MCP server:** agents browse the registry, read a component's docs and run `add`. Reference: shadcn `packages/shadcn/src/mcp/`. Until it ships, `/docs/mcp` says "coming soon".

Exit gate: an MCP client lists and adds a component in a fresh app (extend `smoke:cli`). `npm run check` green. 1.7.0 on npm (ask first).

## 2.0.0

- Remove the legacy themes (vega, maia, rhea, lyra) and the 1.5 names: `style-<name>.css`, `.style-<name>`, `graphite`, `--preset`, `--style`, `--theme <accent>`, old `components.json` keys.
- Carousel gutter after each slide (`-mr-4` / `pr-4`), so a snapped slide shows whole. It moved out of 1.6.0 because it breaks custom gutters.
- New themes.

## Any time

- **Angular 23** (due about Nov 2026): watch the `angular-next` CI job. Then `ng update`, `npm run check`, and raise the peer range. See [COMPAT](docs/COMPAT.md). It lands in whichever phase is open.

## Backlog

Not scheduled.

- **Docs bundle:** drop `@lucide/angular` from the docs. Blocked on `<ng-icon>` sizing: its unlayered host styles beat Tailwind `size-*`, and its `@layer ng-icon` color beats `text-*`. Needs a small CSS shim first. Then the playground scene icons follow the icon library.
- **Mono font slot:** `--font-mono` (preset `fontMono`, CLI `--font-mono`, playground picker, more mono fonts). Mono and its titles read it.
- **Toast:** move focus somewhere sensible after an action closes the toast (today it drops to `<body>`).
- **Site:** the header menu's docs nav can arrive a beat late on a slow first tap; the side nav's links before hydration do a full page load.
- **Tests:** Playwright visual regression.
- **Docs:** search, versioned docs.
- **CLI:** `ivorie list`, `ivorie diff`, third-party registries, an interactive picker.
- **AI parts** from shadcn (attachment, bubble, code-block, marker, message, message-scroller, questionnaire, trace) and **Typography** directives.
- Not needed: `direction`. `@angular/cdk/bidi` `Dir` covers it.

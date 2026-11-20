# Roadmap

Status, next work and the plan by release. Updated 2026-11-26. The why: [PLAN](docs/PLAN.md). Rules: [CLAUDE.md](CLAUDE.md).

## Status

**Latest on npm: 1.5.2.** 1.6.0 is one commit on `release/v1.6.0` with its exit gate green (`npm run check`, `npm run smoke:pack`). It holds Phases 18 and 19 and the pre-publish review fixes.

Next for 1.6.0:

1. Push `release/v1.6.0`. Origin has an older 1.6.0 commit, so this needs `--force-with-lease` (ask first).
2. PR into `main`, merge, tag `v1.6.0`.
3. Publish both packages (ask first). Publishing before the docs deploy matters less now: copied commands pin `npx ivorie@1.6`.

Open items:

- `[user]` Trademark and company legal OK for the name, if still open.
- Post the launch drafts in [docs/LAUNCH.md](docs/LAUNCH.md) after 1.6.0 is on npm.
- Tags: `v1.0.0` to `v1.5.1` are on GitHub. Tag `v1.5.2` and `v1.6.0` after their merges. The old tags `1.1.0` to `1.5.1` (no `v`) remain because the GitHub releases point at them: retarget each release to its `v` tag, then delete the old tags.
- The docs initial bundle is 899 kB of its 900 kB budget. The next addition to the first load fails `build-docs`: trim it (see Backlog) or raise the budget on purpose.

## Releases

| Release | What | Status |
|---|---|---|
| 1.0 to 1.5 | See [CHANGELOG](CHANGELOG.md) | shipped |
| 1.6.0 | Themes and dials, rich parts, data blocks, new site | committed, not published |
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
- **Tests:** Playwright visual regression.
- **Docs:** search, versioned docs.
- **CLI:** `ivorie list`, `ivorie diff`, third-party registries, an interactive picker.
- **AI parts** from shadcn (attachment, bubble, code-block, marker, message, message-scroller, questionnaire, trace) and **Typography** directives.
- Not needed: `direction`. `@angular/cdk/bidi` `Dir` covers it.

## Done phases

Task lists for shipped phases live in git history and the [CHANGELOG](CHANGELOG.md). Phase 18 (themes and dials) and Phase 19 (site redesign) ship together as 1.6.0.

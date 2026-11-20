# Ivorie

Angular 22 UI library `@inlaylab/ivorie` and copy-in CLI `ivorie`, ported from shadcn/ui. One version for both packages.

## Session start

1. Read the **Status** section of [ROADMAP.md](ROADMAP.md). It names the next work. Items marked `[user]` need the user: ask, do not act.
2. Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) before you write component code. Read other docs only when the task needs them.

## Standards

- **Versions:** latest only. Angular 22, Tailwind 4.3, zoneless, Vitest, Node 24. No deprecated or experimental APIs. List: [docs/COMPAT.md](docs/COMPAT.md#code-rules-stay-working-on-new-versions).
- **Components:** signals (`input`, `model`, `output`, `computed`), OnPush, `host: {}`, `inject()`, a `class` input merged with `cn()`, SSR safe, ids from `IvIdGenerator`. Look lives in theme CSS (`cn-*` hooks), never in the component.
- **shadcn first:** copy its classes, variants and behavior. Port the idea, not React code. Keyboard and ARIA follow Radix.
- **Tests first:** write the failing spec, watch it fail, then fix. Every component spec runs axe. A bug fix comes with the test that reproduces it.
- **Smallest change** that solves the whole task. Fix the root cause in shared code. No speculative options.
- **Generated files** are never edited by hand: `projects/ui/styles/theme-*.css` (`tools/styles/derive.ts`, `sync.ts`), `apps/docs/src/generated/`, `apps/docs/src/styles.pack.css`, icon data.
- **Docs and comments:** short, plain sentences. Say what it does and why. No filler, no marketing words.
- **Big choice:** add or update its rule in [docs/DECISIONS.md](docs/DECISIONS.md).

## Process

- A phase marked outline: expand it into tasks, write them in ROADMAP.md, get an OK, then build.
- Per task: test, implement, run its check, update **Status** in ROADMAP.md. No commit between tasks.
- A phase is done when its exit gate passes. Run the commands and show the output.
- New component: "Add a component" in CONVENTIONS.md. New block: `projects/blocks/<name>/` with `<name>.ts` (`export const meta`), `components/`, optional `data.ts`, a spec.
- Docs site UI work: use the frontend-design skill.

## Git and release

- One phase = one minor release = one branch = one PR into `main`. Patch = bug fixes only. Breaking = major.
- Branches from `main`: `feat/<name>`, `fix/<name>`, `chore/<name>`. Lowercase, no version.
- Conventional Commits. No `Co-Authored-By` or AI attribution in commits or PRs.
- One release = one commit:
  1. Exit gate green (`npm run check`, `npm run smoke:pack`).
  2. `npx changeset version` bumps both packages and writes the CHANGELOGs.
  3. Commit `<type>: release X.Y.Z — <summary>`. The body lists the tasks.
  4. PR, merge, tag `vX.Y.Z` on `main`, publish.
- `CHANGELOG.md` headings must stay `## X.Y.Z — YYYY-MM-DD`: the docs changelog page parses them.

## Ask first

- Every npm publish (Release workflow or `npm run publish:all`). It is public and permanent. See [docs/DEPLOY.md](docs/DEPLOY.md).
- Every force-push or history rewrite.

## Commands

| What | Command |
|---|---|
| All gates (offline) | `npm run check` |
| Some gates | `npm run check -- --only <gate>,<gate>` (names in `tools/check.ts`) |
| Library build | `npx ng build ui` |
| Unit tests | `npx ng test ui --watch=false` (one file: `--include <spec>`) |
| Block tests | `npx ng test blocks --watch=false` |
| CLI and tools tests | `node --test "projects/cli/**/*.test.ts" "tools/**/*.test.ts"` |
| Docs app | `npm start` (http://localhost:4200) |
| Package smoke | `npm run smoke:pack` |
| CLI smoke (network) | `npm run smoke:cli` |
| Own theme CSS | `node tools/styles/derive.ts --all` |

## Layout

| Path | What |
|---|---|
| `projects/ui/` | The library. `styles/` holds `theme.css` and `theme-<name>.css` |
| `projects/blocks/` | Blocks for `ivorie add <block>`. `testing/` has spec helpers |
| `projects/cli/` | The CLI. Presets and share codes: `src/preset.ts` |
| `apps/docs/` | Docs and playground (SSR, prerender). Pages in `content/` |
| `apps/module-smoke/` | NgModule smoke app |
| `tools/` | Gates, docs build, registry, style sync and derive, smoke tests |
| `tools/styles/own/` | Sources of Ivorie's own themes |
| `docs/` | ARCHITECTURE, CONVENTIONS, COMPAT, DECISIONS, DEPLOY, PLAN, LAUNCH |
| `docs/superpowers/` | Local plans and specs. Never commit or link them |

## shadcn reference

Local sparse clone (gitignored), made once:

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui .ref/shadcn
git -C .ref/shadcn sparse-checkout set apps/v4/registry packages/shadcn
```

- Component: `.ref/shadcn/apps/v4/registry/bases/radix/ui/<name>.tsx`
- Look: `.cn-*` rules in `.ref/shadcn/apps/v4/registry/styles/style-<name>.css`
- CLI and registry schema: `.ref/shadcn/packages/shadcn/src/`

Open only the file you need. If a path moved, find it with Glob.

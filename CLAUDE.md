# Ivorie — Claude guide

Angular 22 UI library (`@inlaylab/ivorie`) and copy-in CLI (`ivorie`), based on shadcn/ui.

## Start of every session

1. Read [ROADMAP.md](ROADMAP.md): **Status** names the next work, **Must do** comes first. Items marked "user" need the user: ask, do not act.
2. Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) only when you write component code.
3. Read [docs/PLAN.md](docs/PLAN.md) only for the why behind the phases.

## Rules

**Versions.** Latest only: Angular 22, Tailwind 4.3, zoneless, Vitest. No deprecated APIs. See [docs/COMPAT.md](docs/COMPAT.md).

**Branches and commits.**
- One phase = one minor release = one branch = one PR into `main`.
- SemVer: feature = minor, fix = patch, breaking = major. Both packages share one version.
- Branch from `main`: `feat/<name>` (phase), `fix/<name>` (patch), `chore/<name>` (tooling or docs). Lowercase, no version in the name.
- Conventional Commits. No `Co-Authored-By` or any AI attribution line in commits or PRs.

**Work.**
- A phase marked "outline": expand it into tasks (superpowers:writing-plans), write them into ROADMAP.md, get an OK, then build.
- Finish a task, run its check, update **Status** in ROADMAP.md. No commit between tasks.
- A phase is done only when its exit gate passes. Run the commands and show the output.
- New component: follow "Add a component" in [docs/CONVENTIONS.md](docs/CONVENTIONS.md).
- New block: `projects/blocks/<name>/` with the page `<name>.ts` (`export const meta`), `components/`, optional `data.ts`, and a spec.
- Docs site UI work: use the frontend-design skill.
- New big choice: one line in [docs/DECISIONS.md](docs/DECISIONS.md).
- Docs stay short and plain. Short sentences. No filler.

**Release.** One release = one commit.
1. Exit gate green.
2. `npx changeset version`: bumps both packages and writes the CHANGELOGs.
3. One commit `<type>: release X.Y.Z — <summary>`; the body lists the tasks.
4. PR, merge, tag `main`, publish.

**Ask first.**
- Every npm publish (Release workflow or `npm run publish:all`). It is public and cannot be undone. See [docs/DEPLOY.md](docs/DEPLOY.md).
- Every force-push or history rewrite.

## Commands

| What | Command |
|---|---|
| Build library | `npx ng build ui` |
| Unit tests | `npx ng test ui --watch=false` |
| Block tests | `npx ng test blocks --watch=false` |
| Docs app | `npm start` (http://localhost:4200) |
| All gates (no network) | `npm run check` |
| Some gates only | `npm run check -- --only <name>,…` |
| Package smoke | `npm run smoke:pack` |
| CLI smoke (network) | `npm run smoke:cli` |
| Static docs | `npm run docs:build` |
| Manual publish (ask first) | `npm run publish:all` |

Gate names are in `tools/check.ts`.

## Reference: shadcn/ui

Repo: https://github.com/shadcn-ui/ui (MIT). Components copy its classes, variants and behavior.

- Local copy (gitignored), make once:
  ```bash
  git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui .ref/shadcn
  git -C .ref/shadcn sparse-checkout set apps/v4/registry packages/shadcn
  ```
- Component: `.ref/shadcn/apps/v4/registry/bases/radix/ui/<name>.tsx`.
- Look: `.cn-*` rules in `.ref/shadcn/apps/v4/registry/styles/style-<name>.css`.
- CLI: `.ref/shadcn/packages/shadcn/src/`. Registry schema: `.../src/schema/`.
- Open only the file you need. Never read the whole repo. If a path moved, find it with Glob.
- Port the idea, not React code. Angular rules win.

## Where things live

| Path | What |
|---|---|
| `projects/ui/` | The library. `styles/` holds `theme.css` and `style-<name>.css` |
| `projects/blocks/` | Blocks that `ivorie add <block>` copies. `testing/` has spec helpers |
| `projects/cli/` | The `ivorie` CLI |
| `apps/docs/` | Docs and playground (SSR, prerender). Pages in `content/` |
| `apps/module-smoke/` | NgModule smoke app |
| `tools/` | Check, docs build, registry, style sync and derive, smoke tests |
| `.changeset/` | Pending version notes |
| `.github/workflows/` | `ci.yml` checks, `release.yml` npm publish, `docs.yml` GitHub Pages |
| `docs/` | PLAN, ARCHITECTURE, CONVENTIONS, COMPAT, DECISIONS, DEPLOY, LAUNCH |

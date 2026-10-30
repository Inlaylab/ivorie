# Ivorie — Claude guide

Angular 22 UI library (`@inlaylab/ivorie`) + copy-in CLI (`ivorie`). Based on shadcn/ui.
Source was copied once from the admin portal. **Never touch `D:\idemeum\adminportal`.**

## Start of every session
1. Read [ROADMAP.md](ROADMAP.md). **Status** names the current phase and next task. **Pending** holds its tasks.
2. Do the **Must do** items in ROADMAP.md first. Items marked "user" need the user: ask, do not act.
3. Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) only when you write component code.
4. Read [docs/PLAN.md](docs/PLAN.md) only for the why behind the phases.

## Versions
Latest only: Angular 22, Tailwind 4.3, zoneless, Vitest, `@lucide/angular`. No deprecated APIs. See [docs/COMPAT.md](docs/COMPAT.md).

## Rules
- One phase = one branch = one PR. Branch name: `phase-N-short-name`.
- Finish one task → run its check → commit → update **Status** in ROADMAP.md.
- Commit messages and PRs: no `Co-Authored-By` or any AI attribution line.
- A phase is done only when its **exit gate** passes. Run the commands, show the output.
- Phase says "outline only"? Expand it into tasks first (superpowers:writing-plans), write them into ROADMAP.md, get OK, then build.
- Publishing to npm is public and cannot be undone. Ask before every publish.
- Force-push or history rewrite: ask first.
- New big choice? Add one line to [docs/DECISIONS.md](docs/DECISIONS.md).
- Keep docs short and plain. Short sentences. No filler.
- Docs site UI work: use the frontend-design skill.

## Commands
| What | Command |
|---|---|
| Build library | `npx ng build ui` |
| Unit tests (Vitest) | `npx ng test ui --watch=false` |
| Run docs app | `npm start` (or `npx ng serve docs`) |
| All checks (no network) | `npm run check` |
| Package smoke | `npm run smoke:pack` |
| CLI smoke (network) | `npm run smoke:cli` |
| Static docs | `npm run docs:build` |

## Reference: shadcn/ui
Repo: https://github.com/shadcn-ui/ui (MIT). Our components copy its classes, variants and behavior.
- Local copy (gitignored), make once:
  `git clone --depth 1 --filter=blob:none --sparse https://github.com/shadcn-ui/ui .ref/shadcn`
  then `git -C .ref/shadcn sparse-checkout set apps/v4/registry packages/shadcn`
- Components: `.ref/shadcn/apps/v4/registry/bases/radix/ui/<name>.tsx`. Look: `.cn-*` rules in `.ref/shadcn/apps/v4/registry/styles/style-maia.css`. CLI: `.ref/shadcn/packages/shadcn/src/`. Registry schema: `.../src/schema/`.
- Open only the one file you need. Never read the whole repo. If a path moved, find it with Glob.
- Port the idea, not React code. Angular rules win ([docs/CONVENTIONS.md](docs/CONVENTIONS.md)).

## Where things live
- `projects/ui/` — the library. `projects/ui/styles/` — `theme.css` tokens + `style-<name>.css` looks.
- `projects/cli/` — the `ivorie` CLI.
- `apps/docs/` — docs + playground app (SSR, prerender). `apps/module-smoke/` — NgModule smoke app.
- `tools/` — scripts: check, docs build, registry, styles sync, smoke tests, rename map.
- `ROADMAP.md` — status, must do, pending phases, hardening, deferred findings, upcoming features.
- `docs/` — PLAN (why), ARCHITECTURE, CONVENTIONS, COMPAT, DECISIONS, DEPLOY.

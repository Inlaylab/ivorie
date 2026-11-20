# Contributing

Thanks for helping. Read the [Code of Conduct](CODE_OF_CONDUCT.md) first.

## Set up

```bash
npm install
npm start          # docs at http://localhost:4200
npm run check      # every build, test and lint gate; must pass before a PR
```

Use the Node version in [.nvmrc](.nvmrc).

## Change code

- Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) before you write component code.
- Components copy the classes, variants and behavior of [shadcn/ui](https://github.com/shadcn-ui/ui). Port the idea, not the React code.
- Change behavior, change its tests and its docs demo in the same PR. A bug fix comes with a test that fails without it.
- A big design choice adds or updates a rule in [docs/DECISIONS.md](docs/DECISIONS.md).

## Pull requests

- Branch from `main`: `feat/<name>`, `fix/<name>` or `chore/<name>`. One topic per PR.
- Write [Conventional Commits](https://www.conventionalcommits.org/), for example `fix(select): keep focus after close`.
- Fill in the PR template. CI must be green.

## Report a bug or idea

Open an [issue](https://github.com/Inlaylab/ivorie/issues). For a security problem, follow [SECURITY.md](SECURITY.md) and do not open a public issue.

By contributing, you agree to release your work under the [MIT license](LICENSE).

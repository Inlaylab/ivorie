# Contributing

Thanks for helping. Read the [Code of Conduct](CODE_OF_CONDUCT.md) first.

## Set up

```bash
npm install
npm start          # docs at http://localhost:4200
npm run check      # every build, test and lint gate. Must pass before a PR.
```

Needs Node from [.nvmrc](.nvmrc).

## Change code

- Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) before you write component code.
- Our components copy the classes, variants and behavior of [shadcn/ui](https://github.com/shadcn-ui/ui). Port the idea, not React code.
- Add or update tests and the docs demo for any behavior you change.
- A big design choice gets one line in [docs/DECISIONS.md](docs/DECISIONS.md).

## Pull requests

- Branch from `main`. One topic per PR.
- Use clear commit messages, for example `fix(select): keep focus after close`.
- Fill in the PR template. CI must be green.

## Report a bug or idea

Open an [issue](https://github.com/Inlaylab/ivorie/issues). For a security problem, follow [SECURITY.md](SECURITY.md) instead. Do not open a public issue.

By contributing you agree your work is released under the [MIT license](LICENSE).

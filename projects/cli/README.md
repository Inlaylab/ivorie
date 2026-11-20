# ivorie

Copies [Ivorie](https://github.com/Inlaylab/ivorie) Angular components and blocks into your app, the way the shadcn/ui CLI does. You own the source.

Needs Angular 22 and Node 22.22.3+ or 24.15+. Docs: https://inlaylab.github.io/ivorie/docs/cli

```bash
npx ivorie init                    # theme, components.json, Tailwind PostCSS
npx ivorie add button dialog       # components land in src/app/ui/
npx ivorie add login-01            # blocks land in src/app/blocks/
npx ivorie apply ivp1_…            # change the theme: a name or a playground code
npx ivorie migrate icons --from lucide --to tabler
```

- `init` writes `components.json`, `<path>/styles/theme.css`, the theme file and `core`. It adds the CSS imports to your styles file and the theme class to `<body>`. `--theme <name|code>` picks the theme. `--accent`, `--font`, `--radius` and the other flags change its defaults.
- `add` copies source into `<path>/<name>/`. It skips a file you changed unless you pass `--overwrite`.
- `apply` switches the theme of an app that ran `init`. It keeps your own `theme-*` classes and CSS imports, and keeps the dials saved in `components.json`.
- `--dry-run` shows what would change. `--skip-install` prints the install command instead of running it.

Run `npx ivorie --help` for every option. The docs site also hosts the registry at `/r/`. Point the CLI at it with `--registry <url>`.

MIT. Based on [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT).

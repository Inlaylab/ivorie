# ivorie

Copy [Ivorie](https://github.com/Inlaylab/ivorie) Angular components and blocks into your app, shadcn/ui style. You own the source.

Needs Angular 22 and Node 22.22.3+ or 24.15+. **Docs:** https://inlaylab.github.io/ivorie/docs/cli

```bash
npx ivorie init                    # theme, style, components.json, Tailwind PostCSS
npx ivorie add button dialog       # components land in src/app/ui/
npx ivorie add login-01            # blocks land in src/app/blocks/
npx ivorie apply ivp1_…            # change the look: a preset or a playground code
npx ivorie migrate icons --from lucide --to tabler
```

- `init` writes `components.json`, `<path>/styles/theme.css`, the style file and `core`. It adds the CSS imports to your styles file and the style class to `<body>`.
- `add` copies source into `<path>/<name>/`. A file you changed is skipped unless you pass `--overwrite`.
- `--dry-run` shows what would change. `--skip-install` prints the install command instead of running it.

Run `npx ivorie --help` for every option. The registry is also hosted with the docs at `/r/`; pass it with `--registry <url>`.

MIT. Based on [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT).

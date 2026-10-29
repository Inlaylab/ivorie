# ivorie

Copy [Ivorie](https://github.com/marvelousdev99/ivorie-ui) Angular components into your app, shadcn/ui style.
Needs Angular 22 and Node 22.22.3+ or 24.15+.

```bash
npx ivorie init            # theme, style, components.json, Tailwind PostCSS
npx ivorie add button dialog
npx ivorie migrate src     # update code written for the old ui-* components
```

- `init` writes `components.json`, `<path>/styles/theme.css`, the style file and `core`. It adds the CSS imports to your styles file and the style class to `<body>`.
- `add` copies source into `<path>/<name>/`. A file you changed is skipped unless you pass `--overwrite`.
- `--dry-run` shows what would change. `--skip-install` prints the install command instead of running it.

Run `npx ivorie --help` for every option. The registry is also hosted with the docs at `/r/`; pass it with `--registry <url>`.

MIT. Based on [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT).

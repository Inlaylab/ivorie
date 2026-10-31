# Deploy the docs

## Static host (default)
1. Build: `npm run docs:build`.
   - Under a sub-path (GitHub Pages project site), run the steps by hand. `npm run docs:build -- <args>` goes to `postbuild.ts`, not `ng`:
     `node tools/docs/build.ts && npx ng build docs --base-href /<repo>/ && node tools/docs/postbuild.ts`
2. Check: `node tools/docs/postbuild.ts --verify`.
3. Upload `dist/docs/browser` to any static host. Unknown paths get `404.html`.

## GitHub Pages (live)
`.github/workflows/docs.yml` builds with `--base-href /ivorie/` and deploys on every push to `main`.
- One-time: repo Settings → Pages → Source = **GitHub Actions**.
- URL: `https://inlaylab.github.io/ivorie/`.
- Custom domain later: add it in Settings → Pages, add a CNAME DNS record, change `--base-href` to `/`.

`/all` is server-only. Only the SSR smoke test uses it. A static host does not serve it.

## Node host (optional)
```bash
PORT=4000 NG_ALLOWED_HOSTS=docs.example.com node dist/docs/server/server.mjs
```
- Angular SSR rejects requests whose `Host` is not allowed (HTTP 400).
- `angular.json` allows only `localhost` (`security.allowedHosts`).
- Add your domain with `NG_ALLOWED_HOSTS` (comma-separated) or in `security.allowedHosts`.

# Publish to npm
Publishing is public and cannot be undone. Ask before every publish.

## Release workflow (default)
1. Versions: `npx changeset version` (from 1.1). Both packages share one version.
2. Merge to `main`. CI green.
3. GitHub → Actions → **Release** → Run workflow on `main`. It runs `npm run check`, then publishes `./dist/ui` and `./dist/cli` with provenance.

## Trusted Publisher (one-time per package)
npmjs.com → package → Settings → Trusted Publisher → GitHub Actions: repo `Inlaylab/ivorie`, workflow `release.yml`. Then the workflow needs no `NPM_TOKEN`.

## Manual fallback
`npm run publish:all` runs `npm run check`, then publishes both packages from your machine. It asks for your 2FA code. No provenance.

## If only one package published
Never publish the same version twice. Publish only the missing one, from the repo root: `npm publish ./dist/cli --access public` (or `./dist/ui`).

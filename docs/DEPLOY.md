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

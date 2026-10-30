# Deploy the docs

## Static host (default)
1. Build: `npm run docs:build`.
   - GitHub Pages project site: `npm run docs:build -- --base-href /<repo>/`.
2. Check: `node tools/docs/postbuild.ts --verify`.
3. Upload `dist/docs/browser` to any static host. Unknown paths get `404.html`.

`/all` is server-only. Only the SSR smoke test uses it. A static host does not serve it.

## Node host (optional)
```bash
PORT=4000 NG_ALLOWED_HOSTS=docs.example.com node dist/docs/server/server.mjs
```
- Angular SSR rejects requests whose `Host` is not allowed (HTTP 400).
- `angular.json` allows only `localhost` (`security.allowedHosts`).
- Add your domain with `NG_ALLOWED_HOSTS` (comma-separated) or in `security.allowedHosts`.

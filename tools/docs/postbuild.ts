// After `ng build docs`: static hosts serve 404.html for unknown paths.
// Usage: node tools/docs/postbuild.ts [--verify]
// --verify: also check that the home page, 404.html and every docs page were prerendered.
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const BROWSER = 'dist/docs/browser';

copyFileSync(`${BROWSER}/not-found/index.html`, `${BROWSER}/404.html`);
console.log('docs: 404.html written');

if (process.argv.includes('--verify')) {
  const pages = readFileSync('apps/docs/src/generated/pages.ts', 'utf8');
  const slugs = [...pages.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
  const want = ['index.html', '404.html', ...slugs.map((s) => `docs/${s}/index.html`)];
  const missing = want.filter((f) => !existsSync(`${BROWSER}/${f}`));
  if (missing.length) {
    console.error(`FAIL docs verify: missing ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`PASS docs verify: ${want.length} files`);
}

// After `ng build docs`: static hosts serve 404.html for unknown paths.
// Usage: node tools/docs/postbuild.ts [--verify]
// --verify: also check that the home page, 404.html and every docs page were prerendered.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const BROWSER = 'dist/docs/browser';

copyFileSync(`${BROWSER}/not-found/index.html`, `${BROWSER}/404.html`);
console.log('docs: 404.html written');

// 1.6: the roadmap page became the changelog. A static redirect, so old links never show "Not found" first.
mkdirSync(`${BROWSER}/roadmap`, { recursive: true });
writeFileSync(
  `${BROWSER}/roadmap/index.html`,
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Changelog · Ivorie</title>' +
    '<meta http-equiv="refresh" content="0; url=../changelog/"><link rel="canonical" href="../changelog/">' +
    '</head><body><a href="../changelog/">The roadmap is now the changelog.</a></body></html>\n',
);
console.log('docs: roadmap/index.html redirects to the changelog');

if (process.argv.includes('--verify')) {
  const pages = readFileSync('apps/docs/src/generated/pages.ts', 'utf8');
  const slugs = [...pages.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
  const want = ['index.html', '404.html', 'changelog/index.html', 'roadmap/index.html', ...slugs.map((s) => `docs/${s}/index.html`)];
  const missing = want.filter((f) => !existsSync(`${BROWSER}/${f}`));
  if (missing.length) {
    console.error(`FAIL docs verify: missing ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`PASS docs verify: ${want.length} files`);
}

// Size budget for @inlaylab/ivorie/chart: the built entry plus d3, minified and gzipped, under 45 kB.
// Angular and ivorie/core are external: the app ships them anyway. Run after `ng build ui`.
// Usage: node tools/size/chart.ts
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const ENTRY = 'dist/ui/fesm2022/inlaylab-ivorie-chart.mjs';
const LIMIT_KB = 45;

if (!existsSync(ENTRY)) {
  console.error(`${ENTRY} is missing. Run \`npx ng build ui\` first.`);
  process.exit(1);
}

const result = await build({
  entryPoints: [ENTRY],
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  write: false,
  logLevel: 'error',
  external: ['@angular/*', '@inlaylab/ivorie/core'],
});

const kb = gzipSync(result.outputFiles[0].contents).length / 1000;
console.log(`chart: ${kb.toFixed(1)} kB gz`);
if (kb >= LIMIT_KB) {
  console.error(`chart entry is ${kb.toFixed(1)} kB gz; the budget is under ${LIMIT_KB} kB.`);
  process.exit(1);
}

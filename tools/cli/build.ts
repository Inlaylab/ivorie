// Builds the ivorie CLI package into dist/cli: bundled registry, compiled JS, schema, rename map.
// Usage: node tools/cli/build.ts
import { execSync } from 'node:child_process';
import { chmodSync, copyFileSync, cpSync, mkdirSync, rmSync } from 'node:fs';
import { build } from '../registry/build.ts';

const OUT = 'dist/cli';

rmSync(OUT, { recursive: true, force: true });
build(`${OUT}/registry`);
execSync('npx tsc -p projects/cli/tsconfig.json', { stdio: 'inherit' });
copyFileSync('projects/cli/package.json', `${OUT}/package.json`);
copyFileSync('projects/cli/README.md', `${OUT}/README.md`);
copyFileSync('LICENSE', `${OUT}/LICENSE`);
cpSync('projects/cli/schema', `${OUT}/schema`, { recursive: true });
mkdirSync(`${OUT}/migrate`, { recursive: true });
copyFileSync('tools/rename/rename-map.json', `${OUT}/migrate/rename-map.json`);
if (process.platform !== 'win32') chmodSync(`${OUT}/index.js`, 0o755);
console.log(`cli: built ${OUT}`);

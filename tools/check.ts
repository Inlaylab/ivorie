// Runs every gate and prints one PASS/FAIL line each. Full logs go to .check/<name>.log.
// Usage: npm run check
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface Step {
  name: string;
  cmd: string;
}

interface Rule {
  name: string;
  pattern: RegExp;
  paths: string[];
  /** 'line' (default) tests each line of each file; 'path' tests each file path. */
  on?: 'line' | 'path';
  /** Files whose path matches are skipped. */
  exclude?: RegExp;
}

export const steps: Step[] = [
  { name: 'build-ui', cmd: 'npx ng build ui' },
  // Tools tests; some read dist/ui, so they run after build-ui.
  { name: 'test-tools', cmd: 'node --test "tools/**/*.test.ts"' },
  { name: 'publint', cmd: 'npx publint dist/ui --strict' },
  // Angular packages are ESM-only. The styles are CSS exports, not JS entries.
  {
    name: 'attw',
    cmd: 'npx attw --pack dist/ui --profile esm-only --exclude-entrypoints ./styles/theme.css ./styles/style-vega.css ./styles/style-nova.css ./styles/style-maia.css ./styles/style-luma.css ./styles/style-rhea.css',
  },
  { name: 'test-ui', cmd: 'npx ng test ui --watch=false' },
  { name: 'test-cli', cmd: 'node --test "projects/cli/**/*.test.ts"' },
  { name: 'build-registry', cmd: 'node tools/registry/build.ts' },
  { name: 'build-cli', cmd: 'node tools/cli/build.ts' },
  // Runs the compiled CLI, so it is not in the test-cli glob.
  { name: 'test-cli-bin', cmd: 'node --test projects/cli/test/bin.e2e.ts' },
  { name: 'publint-cli', cmd: 'npx publint dist/cli --strict' },
  { name: 'build-docs', cmd: 'node tools/docs/build.ts && npx ng build docs' },
  // Dev build: Angular reports hydration mismatches (NG0500) only in dev mode.
  {
    name: 'smoke-ssr',
    cmd: 'npx ng build docs -c development --output-path dist/docs-dev && node tools/smoke/ssr.ts dist/docs-dev',
  },
  // Docs specs import the generated pages, so they run after build-docs.
  { name: 'test-docs', cmd: 'npx ng test docs --watch=false' },
  { name: 'build-module-smoke', cmd: 'npx ng build module-smoke' },
  { name: 'test-module-smoke', cmd: 'npx ng test module-smoke --watch=false' },
];

// Grep gates: a rule passes when the pattern has zero matches. Later phases append here.
export const rules: Rule[] = [
  {
    name: 'no-ui-prefix',
    pattern: /(?<![\w-])(ui-[a-z]|ui[A-Z]|Ui[A-Z]|UI_[A-Z])/,
    paths: ['projects/ui', 'apps/docs/src', 'apps/module-smoke/src'],
    // Generated pages quote the old ui-* names in the migrate docs.
    exclude: /[\\/]generated[\\/]/,
  },
  // Import from entry points (@ivorie/ui/<name>), never the empty root barrel.
  { name: 'no-root-import', pattern: /from '@ivorie\/ui'/, paths: ['apps/docs', 'apps/module-smoke', 'projects/ui'] },
  // Copy-in readiness: component folders import each other only via @ivorie/ui/<name>.
  { name: 'no-relative-cross-import', pattern: /from '\.\.\//, paths: ['projects/ui'] },
  // Docs live in apps/docs. Lowercase only: the package README.md stays.
  { name: 'no-lib-readme', pattern: /[\\/]readme\.md$/, paths: ['projects/ui'], on: 'path' },
  // Signal inputs only.
  { name: 'no-input-decorator', pattern: /@Input\(/, paths: ['projects/ui'] },
  // The "No" list in docs/COMPAT.md.
  {
    name: 'no-deprecated-api',
    pattern:
      /@(Input|Output|ViewChild|ViewChildren|ContentChild|ContentChildren|HostBinding|HostListener)\(|\*ng(If|For|Switch)|\bng(Class|Style)\b|Ng(Class|Style|Zone)\b|@angular\/animations|ɵ|new EventEmitter/,
    paths: ['projects/ui'],
  },
  // SSR safe: inject(DOCUMENT) and guard browser-only code. Specs run in jsdom and may use them.
  {
    name: 'no-dom-globals',
    pattern: /(?<![\w.])(window|document)\./,
    paths: ['projects/ui'],
    exclude: /\.spec\.ts$/,
  },
];

const LOG_DIR = '.check';
const SKIP_DIRS = new Set(['node_modules', 'dist', '.angular', '.git']);

function files(path: string): string[] {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path)
    .filter((name) => !SKIP_DIRS.has(name))
    .flatMap((name) => files(join(path, name)));
}

function hits(rule: Rule): string[] {
  const found: string[] = [];
  for (const file of rule.paths.flatMap(files)) {
    if (rule.exclude?.test(file)) continue;
    if (rule.on === 'path') {
      if (rule.pattern.test(file)) found.push(file);
      continue;
    }
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (rule.pattern.test(line)) found.push(`${file}:${i + 1}: ${line.trim()}`);
      });
  }
  return found;
}

mkdirSync(LOG_DIR, { recursive: true });
let failed = false;

for (const step of steps) {
  const run = spawnSync(step.cmd, { shell: true, encoding: 'utf8' });
  const log = join(LOG_DIR, `${step.name}.log`);
  writeFileSync(log, `${run.stdout ?? ''}${run.stderr ?? ''}`);
  if (run.status === 0) {
    console.log(`PASS ${step.name}`);
  } else {
    failed = true;
    console.log(`FAIL ${step.name} → ${log}`);
  }
}

for (const rule of rules) {
  const found = hits(rule);
  if (found.length === 0) {
    console.log(`PASS ${rule.name}`);
  } else {
    failed = true;
    console.log(`FAIL ${rule.name} (${found.length} hits)`);
    found.slice(0, 5).forEach((hit) => console.log(`  ${hit}`));
  }
}

process.exit(failed ? 1 : 0);

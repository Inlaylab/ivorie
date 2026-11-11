// Runs every gate and prints one PASS/FAIL line each. Full logs go to .check/<name>.log.
// Usage: npm run check, or npm run check -- --only <name>[,<name>] for some steps and rules.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOM_GLOBALS, codeOf } from './dom-globals.ts';

interface Step {
  name: string;
  cmd: string;
  /** Extra environment for this step only. */
  env?: Record<string, string>;
}

interface Rule {
  name: string;
  pattern: RegExp;
  paths: string[];
  /** 'line' (default) tests each line of each file; 'path' tests each file path. */
  on?: 'line' | 'path';
  /** Files whose path matches are skipped. */
  exclude?: RegExp;
  /** Test only the code part of each line, not comments. */
  ignoreComments?: boolean;
}

export const steps: Step[] = [
  { name: 'build-ui', cmd: 'npx ng build ui' },
  // Chart entry plus d3, gzipped, under 45 kB. Reads dist/ui.
  { name: 'size-chart', cmd: 'node tools/size/chart.ts' },
  // Tools tests; some read dist/ui, so they run after build-ui.
  { name: 'test-tools', cmd: 'node --test "tools/**/*.test.ts"' },
  { name: 'publint', cmd: 'npx publint dist/ui --strict' },
  // Angular packages are ESM-only. The styles are CSS exports, not JS entries.
  {
    name: 'attw',
    cmd: 'npx attw --pack dist/ui --profile esm-only --exclude-entrypoints ./styles/theme.css ./styles/style-vega.css ./styles/style-nova.css ./styles/style-maia.css ./styles/style-luma.css ./styles/style-rhea.css ./styles/style-glass.css ./styles/style-brutal.css ./styles/style-aurora.css ./styles/style-bento.css ./styles/style-mono.css',
  },
  { name: 'test-ui', cmd: 'npx ng test ui --watch=false' },
  { name: 'test-blocks', cmd: 'npx ng test blocks --watch=false' },
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
    // Dev-mode prerender is slow. One worker per core starves each render past its timeout (seen on 12 cores).
    env: { NG_BUILD_MAX_WORKERS: '2' },
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
  // Import from entry points (@inlaylab/ivorie/<name>), never the empty root barrel.
  { name: 'no-root-import', pattern: /from '@inlaylab\/ivorie'/, paths: ['apps/docs', 'apps/module-smoke', 'projects/ui'] },
  // Copy-in readiness: component folders import each other only via @inlaylab/ivorie/<name>.
  { name: 'no-relative-cross-import', pattern: /from '\.\.\//, paths: ['projects/ui'] },
  // Docs live in apps/docs. Lowercase only: the package README.md stays.
  { name: 'no-lib-readme', pattern: /[\\/]readme\.md$/, paths: ['projects/ui'], on: 'path' },
  // Signal inputs only.
  { name: 'no-input-decorator', pattern: /@Input\(/, paths: ['projects/ui', 'projects/blocks'] },
  // The "No" list in docs/COMPAT.md.
  {
    name: 'no-deprecated-api',
    pattern:
      /@(Input|Output|ViewChild|ViewChildren|ContentChild|ContentChildren|HostBinding|HostListener)\(|\*ng(If|For|Switch)|\bng(Class|Style)\b|Ng(Class|Style|Zone)\b|@angular\/animations|ɵ|new EventEmitter/,
    paths: ['projects/ui', 'projects/blocks'],
  },
  // SSR safe: inject(DOCUMENT) and guard browser-only code. Specs run in jsdom and may use them.
  {
    name: 'no-dom-globals',
    pattern: DOM_GLOBALS,
    paths: ['projects/ui', 'projects/blocks'],
    // Specs and the blocks' shared spec helpers run in jsdom.
    exclude: /\.spec\.ts$|[\\/]blocks[\\/]testing[\\/]/,
    ignoreComments: true,
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
        if (rule.pattern.test(rule.ignoreComments ? codeOf(line) : line)) found.push(`${file}:${i + 1}: ${line.trim()}`);
      });
  }
  return found;
}

mkdirSync(LOG_DIR, { recursive: true });
let failed = false;
const only = process.argv.includes('--only') ? new Set(process.argv[process.argv.indexOf('--only') + 1]?.split(',')) : null;
const picked = (name: string) => !only || only.has(name);
const unknown = [...(only ?? [])].filter((n) => ![...steps, ...rules].some((x) => x.name === n));
if (only && (!only.size || unknown.length)) {
  console.log(`FAIL --only: unknown ${unknown.join(', ') || '(none given)'}`);
  process.exit(1);
}

for (const step of steps.filter((s) => picked(s.name))) {
  const run = spawnSync(step.cmd, { shell: true, encoding: 'utf8', env: { ...process.env, ...step.env } });
  const log = join(LOG_DIR, `${step.name}.log`);
  writeFileSync(log, `${run.stdout ?? ''}${run.stderr ?? ''}`);
  if (run.status === 0) {
    console.log(`PASS ${step.name}`);
  } else {
    failed = true;
    console.log(`FAIL ${step.name} → ${log}`);
  }
}

for (const rule of rules.filter((r) => picked(r.name))) {
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

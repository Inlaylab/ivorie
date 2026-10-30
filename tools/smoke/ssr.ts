// SSR smoke: runs the built docs server, fetches /all raw, then loads /all and every page in
// system Chrome. Fails on a server error, a console error or an NG0xxx warning.
// Usage: node tools/smoke/ssr.ts [distDir] (default dist/docs). Env: SMOKE_PORT (4310), SMOKE_BROWSER (chrome | msedge).
// Use a development build to catch hydration mismatches: Angular checks DOM nodes (NG0500) only in dev mode.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright-core';
import { failureOf, serverFailure } from './ssr-rules.ts';

const SERVER = `${process.argv[2] ?? 'dist/docs'}/server/server.mjs`;
const PORT = process.env['SMOKE_PORT'] ?? '4310';
const CHANNEL = process.env['SMOKE_BROWSER'] ?? 'chrome';
const BASE = `http://localhost:${PORT}`;

if (!existsSync(SERVER)) {
  console.error(`FAIL smoke-ssr: ${SERVER} missing, run ng build docs`);
  process.exit(1);
}

const keys = (file: string, re: RegExp) =>
  [...readFileSync(file, 'utf8').matchAll(re)].map((m) => m[1]);
const demos = keys('apps/docs/src/generated/demos.ts', /^\s*'([^']+)':/gm);
const slugs = keys('apps/docs/src/generated/pages.ts', /slug: "([^"]+)"/g);

const failures: string[] = [];
const server = spawn(process.execPath, [SERVER], { env: { ...process.env, PORT } });
let browser: Browser | undefined;

function onLines(stream: NodeJS.ReadableStream, each: (line: string) => void) {
  let rest = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk: string) => {
    const lines = (rest + chunk).split(/\r?\n/);
    rest = lines.pop() ?? '';
    lines.forEach(each);
  });
}

onLines(server.stderr!, (line) => {
  const f = serverFailure(line);
  if (f) failures.push(f);
});

function listening(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not print "listening" in 30 s')), 30_000);
    onLines(server.stdout!, (line) => {
      if (line.includes('listening')) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.once('exit', (code) => reject(new Error(`server exited with code ${code}`)));
  });
}

async function visit(page: Page, path: string) {
  const res = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  if (res?.status() !== 200) failures.push(`${path}: status ${res?.status()}`);
}

try {
  await listening();

  const all = await fetch(`${BASE}/all`);
  const html = await all.text();
  if (all.status !== 200) failures.push(`/all: status ${all.status}`);
  if (!html.includes('ngh=')) failures.push('/all: no ngh= (hydration info missing)');
  const missing = demos.filter((d) => !html.includes(`data-demo="${d}"`));
  if (missing.length) failures.push(`/all: missing demos ${missing.join(', ')}`);
  const nope = await fetch(`${BASE}/nope`);
  if (nope.status !== 404) failures.push(`/nope: status ${nope.status}, want 404`);

  try {
    browser = await chromium.launch({ channel: CHANNEL });
  } catch (err) {
    console.error(String(err).split('\n')[0]);
    console.error('set SMOKE_BROWSER=msedge or install Chrome');
    process.exitCode = 1;
    throw err;
  }
  const page = await browser.newPage();
  let at = '/all';
  page.on('console', (msg) => {
    // First line only: dev-mode errors carry long stacks.
    const f = failureOf({ type: msg.type(), text: msg.text().split('\n')[0] });
    if (f) failures.push(`${at}: ${f}`);
  });
  page.on('pageerror', (err) => failures.push(`${at}: page error: ${err.message}`));

  await visit(page, '/all');
  await page.waitForSelector('[data-hydrated="true"]', { timeout: 10_000 });
  await page.locator('[data-demo="dialog"] button').first().click();
  await page.waitForSelector('[role="dialog"]', { timeout: 3_000 });

  for (const slug of slugs) {
    at = `/docs/${slug}`;
    await visit(page, at);
  }
} catch (err) {
  failures.push(String(err instanceof Error ? err.message : err).split('\n')[0]);
} finally {
  await browser?.close();
  server.kill();
}

if (failures.length) {
  console.error(`FAIL smoke-ssr:\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`PASS smoke-ssr: /all + ${slugs.length} pages`);

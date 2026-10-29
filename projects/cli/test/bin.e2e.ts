// Runs the compiled CLI. Needs `node tools/cli/build.ts` first (check step build-cli).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const BIN = resolve('dist/cli/index.js');
const run = (args: string[], cwd = process.cwd()) =>
  spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });

test('--version prints the package version', () => {
  const r = run(['--version']);
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), JSON.parse(readFileSync('projects/cli/package.json', 'utf8')).version);
});

test('--help lists the commands', () => {
  const r = run(['--help']);
  assert.equal(r.status, 0);
  for (const c of ['init', 'add', 'migrate']) assert.match(r.stdout, new RegExp(`^  ${c}\\b`, 'm'));
});

test('an unknown command exits 1 with help', () => {
  const r = run(['nope']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unknown command "nope"/);
});

test('add without components.json fails with a hint', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ivorie-bin-'));
  try {
    const r = run(['add', 'button'], dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /error: components\.json not found — run "ivorie init"/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

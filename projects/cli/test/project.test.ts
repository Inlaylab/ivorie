import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectProject } from '../src/project.ts';
import { installCommand } from '../src/install.ts';

const fixture = (name: string) => join('projects/cli/test/fixtures', name);

test('ng-app: one app with the defaults', () => {
  const p = detectProject(fixture('ng-app'));
  assert.deepEqual(
    { name: p.name, sourceRoot: p.sourceRoot, stylesFile: p.stylesFile, indexHtml: p.indexHtml, pm: p.pm, angularMajor: p.angularMajor },
    { name: 'demo', sourceRoot: 'src', stylesFile: 'src/styles.css', indexHtml: 'src/index.html', pm: 'npm', angularMajor: 22 },
  );
  assert.ok(p.deps.has('@angular/core') && p.deps.has('@angular/cli'));
});

test('ng-multi: several apps need --project', () => {
  assert.throws(() => detectProject(fixture('ng-multi')), { message: 'several apps: a, b — use --project' });
  const b = detectProject(fixture('ng-multi'), { project: 'b' });
  assert.equal(b.stylesFile, 'projects/b/src/styles.css');
  assert.throws(() => detectProject(fixture('ng-multi'), { project: 'zz' }), /no app "zz" \(apps: a, b\)/);
});

test('ng-objstyles: object styles and index, default sourceRoot', () => {
  const p = detectProject(fixture('ng-objstyles'));
  assert.equal(p.stylesFile, 'src/global.css');
  assert.equal(p.indexHtml, 'src/main.html');
  assert.equal(p.sourceRoot, 'src');
});

test('ng-old: Angular below 22 is refused', () => {
  assert.throws(() => detectProject(fixture('ng-old')), { message: 'Angular 22 or newer is required (found 21)' });
});

test('no angular.json is refused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ivorie-noapp-'));
  assert.throws(() => detectProject(dir), /angular\.json not found/);
  rmSync(dir, { recursive: true, force: true });
});

test('package manager comes from the lockfile', () => {
  for (const [lock, pm] of [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lock', 'bun'],
    [null, 'npm'],
  ] as const) {
    const dir = mkdtempSync(join(tmpdir(), 'ivorie-pm-'));
    cpSync(fixture('ng-app'), dir, { recursive: true });
    rmSync(join(dir, 'package-lock.json'));
    if (lock) writeFileSync(join(dir, lock), '');
    assert.equal(detectProject(dir).pm, pm, String(lock));
    rmSync(dir, { recursive: true, force: true });
  }
});

test('installCommand per package manager', () => {
  assert.deepEqual(installCommand('npm', ['a', 'b']), ['npm', 'install', 'a', 'b']);
  assert.deepEqual(installCommand('npm', ['a'], true), ['npm', 'install', '-D', 'a']);
  assert.deepEqual(installCommand('pnpm', ['a'], true), ['pnpm', 'add', '-D', 'a']);
  assert.deepEqual(installCommand('yarn', ['a']), ['yarn', 'add', 'a']);
  assert.deepEqual(installCommand('bun', ['a']), ['bun', 'add', 'a']);
});

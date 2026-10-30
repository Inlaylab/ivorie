import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('projects/cli/package.json', 'utf8'));

test('the CLI has no runtime dependencies', () => {
  assert.equal(pkg.dependencies, undefined);
});

test('bin points to ./index.js', () => {
  assert.deepEqual(pkg.bin, { ivorie: './index.js' });
});

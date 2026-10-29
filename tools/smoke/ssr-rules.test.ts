import { test } from 'node:test';
import assert from 'node:assert/strict';
import { failureOf, serverFailure } from './ssr-rules.ts';

test('console error is a failure', () => {
  assert.ok(failureOf({ type: 'error', text: 'boom' }));
});

test('NG0xxx warning is a failure', () => {
  assert.ok(failureOf({ type: 'warning', text: 'NG0500: hydration mismatch' }));
});

test('other warnings and logs pass', () => {
  assert.equal(failureOf({ type: 'warning', text: 'slow image' }), null);
  assert.equal(failureOf({ type: 'log', text: 'NG0500 in a log' }), null);
  assert.equal(failureOf({ type: 'info', text: 'hi' }), null);
});

test('server errors are failures', () => {
  assert.ok(serverFailure('ReferenceError: window is not defined'));
  assert.ok(serverFailure("TypeError: Cannot read properties of undefined (reading 'x')"));
  assert.ok(serverFailure('ERROR RuntimeError: NG0950: Input is required'));
  assert.ok(serverFailure('ERROR RangeError: Invalid time value'));
  assert.ok(serverFailure('Error: boom'));
});

test('plain server lines pass', () => {
  assert.equal(serverFailure('Node Express server listening on http://localhost:4310'), null);
  assert.equal(serverFailure(''), null);
});

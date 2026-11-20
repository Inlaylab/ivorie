// Tracker colors: ok green, warn orange, error red, in every theme. --tracker-ok is an opt-in override.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { themeNames } from './hooks.ts';

const css = (n: string) => readFileSync(`projects/ui/styles/theme-${n}.css`, 'utf8');

test('every theme paints ok bars green unless --tracker-ok is set', () => {
  for (const n of themeNames()) assert.match(css(n), /data-\[status=ok\]:bg-\[var\(--tracker-ok,var\(--color-emerald-500\)\)\]/, n);
});

test('no theme sets --tracker-ok by default', () => {
  for (const n of themeNames()) assert.doesNotMatch(css(n), /--tracker-ok:/, n);
});

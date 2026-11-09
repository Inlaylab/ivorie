// The docs site material (apps/docs/src/styles.css): ink and muted ink must read on the ground and on
// a pane, in light and dark (WCAG AA, 4.5:1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('apps/docs/src/styles.css', 'utf8');

function tokens(selector: string): Record<string, string> {
  const body = new RegExp(`^${selector.replace('.', '\.')} \{([^}]*)\}`, 'm').exec(css)![1];
  return Object.fromEntries([...body.matchAll(/(--docs-[\w-]+):\s*(#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const [mode, selector] of [['light', ':root'], ['dark', '.dark']]) {
  test(`${mode}: ink and muted ink reach 4.5:1 on ground and pane`, () => {
    const t = tokens(selector);
    for (const text of ['--docs-ink', '--docs-ink-muted']) {
      for (const surface of ['--docs-ground', '--docs-pane-solid']) {
        const r = ratio(t[text], t[surface]);
        assert.ok(r >= 4.5, `${mode} ${text} on ${surface}: ${r.toFixed(2)}`);
      }
    }
  });
}

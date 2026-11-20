// Each own style shapes its controls in its own language. A control's corners come from the style,
// never from a fixed class that ignores it: Mono is square whatever the radius.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STYLES, themeNames } from './hooks.ts';

/** Control hook families: the hook itself and its `-variant-*` / `-size-*` hooks. */
const CONTROLS = [
  'button', 'checkbox', 'radio-group-item', 'radio-group-indicator-icon', 'switch', 'switch-thumb', 'slider-track',
  'slider-range', 'slider-thumb', 'progress', 'tabs-list', 'tabs-trigger', 'input', 'textarea', 'input-group',
  'select-trigger', 'badge', 'toggle', 'toggle-group-item', 'kbd',
];

/**
 * The corner class that wins for each hook: the last plain `rounded-*` (no variant prefix, no side)
 * in file order, over every rule whose selector names the hook. Later rules win: same layer, same specificity.
 */
export function corners(css: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of css.matchAll(/([^{}]*)\{\s*@apply ([^;]+);/g)) {
    const hooks = [...m[1].matchAll(/\.cn-([a-z0-9-]+)(?![\w-])/g)].map((h) => h[1]);
    const round = m[2].split(/\s+/).filter((c) => /^rounded-(?![trblse]-)[^:]+$/.test(c) || c === 'rounded');
    if (!round.length) continue;
    for (const h of hooks) out.set(h, round.at(-1)!);
  }
  return out;
}

const read = (style: string) => corners(readFileSync(join(STYLES, `theme-${style}.css`), 'utf8'));
const family = (map: Map<string, string>, control: string) =>
  [...map.keys()].filter((h) => h === control || h.startsWith(`${control}-variant-`) || h.startsWith(`${control}-size-`));

test('corners(): the last plain rounded class wins', () => {
  const map = corners('.cn-a { @apply rounded-lg data-x:rounded-full; } & .cn-a, & .cn-b { @apply rounded-t-md rounded-none; }');
  assert.equal(map.get('a'), 'rounded-none');
  assert.equal(map.get('b'), 'rounded-none');
});

test('mono controls are square', () => {
  const map = read('mono');
  const round: string[] = [];
  for (const control of CONTROLS) {
    for (const hook of family(map, control)) if (map.get(hook) !== 'rounded-none') round.push(`${hook}: ${map.get(hook)}`);
  }
  assert.deepEqual(round, []);
});

// The shape each own style gives a few telling controls (spec: shape language per theme).
const SHAPES: Record<string, Record<string, string>> = {
  glass: { button: 'rounded-full', 'tabs-trigger': 'rounded-full', switch: 'rounded-full' },
  bento: { button: 'rounded-full', 'tabs-trigger': 'rounded-full', switch: 'rounded-full' },
  clay: { button: 'rounded-xl', checkbox: 'rounded-md' },
  midnight: { button: 'rounded-md', checkbox: 'rounded-sm' },
  slate: { button: 'rounded-sm', checkbox: 'rounded-sm' },
};

for (const [style, shapes] of Object.entries(SHAPES)) {
  test(`${style} controls follow its shape language`, () => {
    const map = read(style);
    const wrong = Object.entries(shapes).filter(([hook, shape]) => map.get(hook) !== shape).map(([hook]) => `${hook}: ${map.get(hook)}`);
    assert.deepEqual(wrong, []);
  });
}

// The density dial scales --spacing; a px track would leave the checked thumb short of its end (compact).
for (const file of themeNames().map((n) => `theme-${n}.css`)) {
  test(`${file}: the switch track is sized in spacing units`, () => {
    const css = readFileSync(join(STYLES, file), 'utf8');
    for (const m of css.matchAll(/\.cn-switch(?![\w-])[^{]*\{\s*@apply ([^;]+);/g)) {
      assert.deepEqual(m[1].match(/\b[hw]-\[[\d.]+px\]/g) ?? [], [], 'px track size');
    }
  });
}

// A pill corner on a tall box reads as an ellipse: a theme that pills the tab list must give the vertical
// list its own corner (shadcn's pill themes use group-data-vertical/tabs:rounded-2xl).
for (const file of themeNames().map((n) => `theme-${n}.css`)) {
  test(`${file}: a pill tab list has a vertical corner`, () => {
    const css = readFileSync(join(STYLES, file), 'utf8');
    if (!/rounded-(full|4xl|3xl)/.test(corners(css).get('tabs-list') ?? '')) return;
    const rules = [...css.matchAll(/([^{}]*)\{\s*@apply ([^;]+);/g)].filter((m) => /\.cn-tabs-list(?![\w-])/.test(m[1]));
    assert.ok(rules.some((m) => /group-data-vertical\/tabs:rounded-/.test(m[2])), 'no group-data-vertical/tabs:rounded-*');
  });
}

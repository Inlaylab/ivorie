// Text must stay readable on every own style's surfaces, for every base color, light and dark.
// Translucent glass surfaces are composited over the page background and over each mesh color.
// A pair that is below 4.5 on the solid shadcn base color too (olive muted text) is shadcn's value:
// there a style may not lose more than 0.1 of the solid ratio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Rgb, contrast, mix, oklch, over } from './color.ts';
import { OWN } from './derive.ts';
import { STYLES } from './hooks.ts';

test('color: black on white is 21, neutral foreground on background is 19.8', () => {
  assert.ok(Math.abs(contrast(oklch('oklch(1 0 0)'), oklch('oklch(0 0 0)')) - 21) < 0.05);
  assert.ok(Math.abs(contrast(oklch('oklch(1 0 0)'), oklch('oklch(0.145 0 0)')) - 19.8) < 0.1);
});

test('color: over() at alpha 0 is the bottom, at 1 the top; alpha in oklch() is ignored', () => {
  assert.deepEqual(over([1, 1, 1], 0, [0, 0, 0]), [0, 0, 0]);
  assert.deepEqual(over([1, 1, 1], 1, [0, 0, 0]), [1, 1, 1]);
  assert.deepEqual(oklch('oklch(1 0 0 / 10%)'), oklch('oklch(1 0 0)'));
});

test('color: mix() interpolates in oklab; half white, half black is L 0.5', () => {
  assert.ok(Math.abs(contrast(mix('oklch(1 0 0)', 'oklch(0 0 0)', 0.5), oklch('oklch(1 0 0)')) - 6) < 0.05);
  assert.deepEqual(mix('oklch(0.3 0.1 200)', 'oklch(0.9 0 0)', 1), oklch('oklch(0.3 0.1 200)'));
});

type Mode = 'light' | 'dark';
const COLORS = 'tools/registry/base-colors';
/** Text pairs: foreground token on surface token. */
const PAIRS: [string, string][] = [
  ['card-foreground', 'card'],
  ['muted-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['sidebar-foreground', 'sidebar'],
];

/** `--name: value;` from the derived file's `& {` (light) or `.dark & {` (dark) block. */
function token(css: string, mode: Mode, name: string): string | undefined {
  const head = mode === 'light' ? '\n    & {' : '\n    .dark & {';
  const at = css.indexOf(head);
  const body = at < 0 ? '' : css.slice(at, css.indexOf('}', at));
  const light = mode === 'dark' ? token(css, 'light', name) : undefined;
  return new RegExp(`--${name}: ([^;]+);`).exec(body)?.[1] ?? light;
}

/**
 * A token value as a color: `var(--x)`, `oklch(…)`, or `color-mix(in oklab, A [p%], B [q%])` of those.
 * Tokens of the style itself are read with `own`, base color tokens with `base`.
 */
function resolve(value: string, base: Record<string, string>, own: (n: string) => string | undefined): string {
  const v = value.trim();
  const ref = /^var\(--([a-z0-9-]+)\)$/.exec(v);
  if (ref) return resolve(own(ref[1]) ?? base[`--${ref[1]}`], base, own);
  const m = /^color-mix\(in oklab, (.+?)(?: ([\d.]+)%)?, (.+?)(?: ([\d.]+)%)?\)$/.exec(v);
  if (!m) return v;
  const p = m[2] ? Number(m[2]) / 100 : m[4] ? 1 - Number(m[4]) / 100 : 0.5;
  const [x, y] = [resolve(m[1], base, own), resolve(m[3], base, own)];
  const rgb = mix(x, y, p);
  // Back to oklch() text is not needed: mixes are only ever ends of a chain, so hand back a marker.
  return `rgb:${rgb.join(',')}`;
}

const toRgb = (css: string): Rgb => (css.startsWith('rgb:') ? (css.slice(4).split(',').map(Number) as Rgb) : oklch(css));

for (const file of readdirSync(OWN).filter((f) => f.endsWith('.css'))) {
  const style = file.slice(0, -4);
  const css = readFileSync(join(STYLES, `style-${style}.css`), 'utf8');
  for (const colorFile of readdirSync(COLORS).filter((f) => f.endsWith('.json'))) {
    const color = JSON.parse(readFileSync(join(COLORS, colorFile), 'utf8')) as Record<Mode, Record<string, string>>;
    for (const mode of ['light', 'dark'] as const) {
      const name = `${style} / ${colorFile.slice(0, -5)} / ${mode}`;
      test(`${name}: text contrast >= 4.5`, () => {
        const base = color[mode];
        // The style's own tokens are named --<style>-*: --glass-alpha, --bento-page, …
        const own = (n: string) => token(css, mode, n.startsWith(`${style}-`) ? n : `${style}-${n}`) ?? token(css, mode, n);
        const t = (n: string): Rgb => toRgb(resolve(`var(--${n})`, base, (x) => (x.startsWith(`${style}-`) ? token(css, mode, x) : undefined)));
        const alpha = Number(own('alpha') ?? 1);
        // Floating panes (popovers, menus, dialogs) have their own, higher alpha.
        const floatAlpha = Number(own('float-alpha') ?? alpha);
        const meshAlpha = Number(own('mesh-alpha') ?? 0);
        const meshes = [1, 2, 3]
          .map((i) => own(`mesh-${i}`))
          .filter((v): v is string => !!v)
          .map((v) => toRgb(resolve(v, base, () => undefined)));
        const page = own('page') ? toRgb(resolve(own('page')!, base, () => undefined)) : t('background');
        const grounds = [page, ...meshes.map((m) => over(m, meshAlpha, page))];
        // A style may mix its muted text from foreground and background, for contrast on its surfaces.
        const mutedMix = own('muted-mix');
        const text = (n: string): Rgb =>
          n === 'muted-foreground' && mutedMix ? mix(base['--foreground'], base['--background'], Number(mutedMix)) : t(n);
        const low: string[] = [];
        for (const [fg, bg] of PAIRS) {
          const need = Math.min(4.5, contrast(t(fg), t(bg)) - 0.1);
          for (const ground of grounds) {
            const ratio = contrast(text(fg), over(t(bg), bg === 'popover' ? floatAlpha : alpha, ground));
            if (ratio < need) low.push(`${fg} on ${bg}: ${ratio.toFixed(2)} < ${need.toFixed(2)}`);
          }
        }
        // Text straight on the page (headings, page descriptions).
        for (const fg of ['foreground', 'muted-foreground']) {
          const need = Math.min(4.5, contrast(t(fg), t('background')) - 0.1);
          const ratio = contrast(text(fg), page);
          if (ratio < need) low.push(`${fg} on page: ${ratio.toFixed(2)} < ${need.toFixed(2)}`);
        }
        assert.deepEqual(low, []);
      });
    }
  }
}

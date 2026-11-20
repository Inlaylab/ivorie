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
import { contrastVars } from '../../projects/cli/src/preset.ts';

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
/** Own styles that must define a hero surface (`--<style>-hero`). Grows as each material gets its hero card. */
const HERO_STYLES = ['glass', 'bento', 'tint', 'mono', 'midnight', 'clay'];
const ACCENTS = 'tools/registry/accent-colors';
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

const NAMED: Record<string, string> = { black: 'oklch(0 0 0)', white: 'oklch(1 0 0)' };

/**
 * A token value as a color: `var(--x)`, `oklch(…)`, or `color-mix(in oklab, A [p%], B [q%])` of those.
 * Tokens of the style itself are read with `own`, base color tokens with `base`.
 */
function resolve(value: string, base: Record<string, string>, own: (n: string) => string | undefined): string {
  const v = NAMED[value.trim()] ?? value.trim();
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
  const css = readFileSync(join(STYLES, `theme-${style}.css`), 'utf8');
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
        // The hero card (`emphasis="hero"`): its own surface token, at the pane alpha.
        const hero = own('hero');
        if (HERO_STYLES.includes(style)) assert.ok(hero, `--${style}-hero is missing`);
        if (hero) {
          const surface = toRgb(resolve(hero, base, (x) => (x.startsWith(`${style}-`) ? token(css, mode, x) : undefined)));
          // A filled hero sets its own text color; a tinted one keeps the card text.
          const heroText = own('hero-foreground');
          const texts: [string, Rgb, number][] = heroText
            ? [['hero-foreground', toRgb(resolve(heroText, base, () => undefined)), 4.5]]
            : ['card-foreground', 'muted-foreground'].map((fg) => [fg, text(fg), Math.min(4.5, contrast(t(fg), t('card')) - 0.1)]);
          for (const [fg, rgb, need] of texts) {
            for (const ground of grounds) {
              const ratio = contrast(rgb, over(surface, Number(own('hero-alpha') ?? alpha), ground));
              if (ratio < need) low.push(`${fg} on hero: ${ratio.toFixed(2)} < ${need.toFixed(2)}`);
            }
          }
        }
        // The chosen item as a filled pill (bento: ink, clay: accent).
        const chosen = own('chosen');
        if (chosen) {
          const ratio = contrast(toRgb(resolve(own('chosen-foreground')!, base, () => undefined)), toRgb(resolve(chosen, base, () => undefined)));
          if (ratio < 4.5) low.push(`chosen pill: ${ratio.toFixed(2)} < 4.5`);
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

// The contrast dial: soft must keep muted text readable, high must raise it.
for (const colorFile of readdirSync(COLORS).filter((f) => f.endsWith('.json'))) {
  const color = JSON.parse(readFileSync(join(COLORS, colorFile), 'utf8')) as Record<Mode, Record<string, string>>;
  for (const mode of ['light', 'dark'] as const) {
    test(`contrast dial / ${colorFile.slice(0, -5)} / ${mode}: soft keeps muted text, high raises it`, () => {
      const vars = color[mode];
      const muted = (level: string) => toRgb(resolve({ ...vars, ...contrastVars(vars, level) }['--muted-foreground'], vars, () => undefined));
      const card = oklch(vars['--card']);
      const solid = contrast(oklch(vars['--muted-foreground']), card);
      assert.ok(contrast(muted('soft'), card) >= Math.min(4.5, solid - 0.1), `soft: ${contrast(muted('soft'), card).toFixed(2)}`);
      assert.ok(contrast(muted('high'), card) > solid, `high: ${contrast(muted('high'), card).toFixed(2)} <= ${solid.toFixed(2)}`);
    });
  }
}

// A hero filled with --primary must read for every accent, not only the base colors.
const neutral = JSON.parse(readFileSync(join(COLORS, 'neutral.json'), 'utf8')) as Record<Mode, Record<string, string>>;
for (const file of readdirSync(OWN).filter((f) => f.endsWith('.css'))) {
  const style = file.slice(0, -4);
  const css = readFileSync(join(STYLES, `theme-${style}.css`), 'utf8');
  if (!token(css, 'light', `${style}-hero-foreground`)) continue;
  test(`${style} hero: text on the fill for every accent`, () => {
    const low: string[] = [];
    for (const accentFile of readdirSync(ACCENTS)) {
      const accent = JSON.parse(readFileSync(join(ACCENTS, accentFile), 'utf8')) as Record<Mode, Record<string, string>>;
      for (const mode of ['light', 'dark'] as const) {
        const base = { ...neutral[mode], ...accent[mode] };
        const ownToken = (x: string) => (x.startsWith(`${style}-`) ? token(css, mode, x) : undefined);
        const color = (n: string) => toRgb(resolve(token(css, mode, `${style}-${n}`)!, base, ownToken));
        const need = Math.min(4.5, contrast(oklch(base['--primary-foreground']), oklch(base['--primary'])) - 0.1);
        const ratio = contrast(color('hero-foreground'), color('hero'));
        if (ratio < need) low.push(`${accentFile.slice(0, -5)} ${mode}: ${ratio.toFixed(2)} < ${need.toFixed(2)}`);
      }
    }
    assert.deepEqual(low, []);
  });
}

// The ambient dial: page light tokens `--<style>-light-N: color-mix(in oklch, var(--x) min(100%, calc(P% * var(--iv-ambient, 1))), transparent)`.
// At vivid (2.5) the haze must not take text on the panes below the usual rule.
const AMBIENT_VIVID = 2.5;
const LIGHT = /^color-mix\(in oklch, var\(--([a-z0-9-]+)\) min\(100%, calc\(([\d.]+)% \* var\(--iv-ambient, 1\)\)\), transparent\)$/;
for (const file of readdirSync(OWN).filter((f) => f.endsWith('.css'))) {
  const style = file.slice(0, -4);
  const css = readFileSync(join(STYLES, `theme-${style}.css`), 'utf8');
  if (!css.includes('var(--iv-ambient, 1)')) continue;
  for (const colorFile of readdirSync(COLORS).filter((f) => f.endsWith('.json'))) {
    const color = JSON.parse(readFileSync(join(COLORS, colorFile), 'utf8')) as Record<Mode, Record<string, string>>;
    for (const mode of ['light', 'dark'] as const) {
      test(`${style} / ${colorFile.slice(0, -5)} / ${mode}: text stays readable at ambient vivid`, () => {
        const base = color[mode];
        const own = (n: string) => token(css, mode, `${style}-${n}`);
        const page = toRgb(resolve(own('page') ?? 'var(--background)', base, () => undefined));
        const lights = [1, 2, 3].map((i) => own(`light-${i}`)).filter((v): v is string => !!v && v !== 'transparent');
        const grounds = [page, ...lights.map((v) => {
          const m = LIGHT.exec(v);
          assert.ok(m, `light token not in the ambient form: ${v}`);
          return over(toRgb(base[`--${m[1]}`]), Math.min(1, (Number(m[2]) / 100) * AMBIENT_VIVID), page);
        })];
        const alpha = Number(own('alpha') ?? 1);
        const mix = own('muted-mix');
        const muted = mix ? mix_(base, Number(mix)) : oklch(base['--muted-foreground']);
        const low: string[] = [];
        for (const ground of grounds) {
          const pane = over(oklch(base['--card']), alpha, ground);
          for (const [name, fg] of [['card-foreground', oklch(base['--card-foreground'])], ['muted-foreground', muted]] as const) {
            const need = Math.min(4.5, contrast(oklch(base[`--${name}`]), oklch(base['--card'])) - 0.1);
            const ratio = contrast(fg, pane);
            if (ratio < need) low.push(`${name}: ${ratio.toFixed(2)} < ${need.toFixed(2)}`);
          }
        }
        assert.deepEqual(low, []);
      });
    }
  }
}
function mix_(base: Record<string, string>, p: number): Rgb {
  return mix(base['--foreground'], base['--background'], p);
}

// The theme re-declares --muted-foreground on every descendant, so the :root value contrastVars writes
// never reaches it. The high dial reaches it through --iv-muted-keep instead.
test('own themes: muted text follows the contrast dial (--iv-muted-keep)', () => {
  for (const file of readdirSync(OWN).filter((f) => f.endsWith('.css'))) {
    const css = readFileSync(join(OWN, file), 'utf8');
    for (const m of css.matchAll(/--muted-foreground:\s*color-mix\([^;]*-muted-mix[^;]*;/g)) {
      assert.match(m[0], /var\(--iv-muted-keep, 1\)/, file);
    }
  }
});

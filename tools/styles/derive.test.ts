import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OWN, deriveStyle, parseOwn } from './derive.ts';
import { STYLES, uiHooks } from './hooks.ts';
import { parse } from './sync.ts';

const base = `@layer components {
  .style-nova {
    /* MARK: Badge */
    .cn-badge {
      @apply h-5 rounded-4xl;
    }

    /* MARK: Card */
    .cn-card {
      @apply rounded-xl border;
    }
  }
}
`;
const hooks = new Set(['cn-badge', 'cn-card', 'cn-button']);

test('parse reads a generated style at indent 4', () => {
  const rules = parse(readFileSync(join(STYLES, 'style-nova.css'), 'utf8'), 4);
  assert.ok(rules.length > 50);
  for (const r of rules) assert.match(r.lines[0], /^ {2}\.cn-/);
});

test('an own rule replaces the base rule, others stay', () => {
  const css = deriveStyle('glass', '/* @base nova */\n.cn-card {\n  @apply bg-red-500;\n}\n', base, hooks);
  assert.ok(css.includes('    /* MARK: Card */\n    .cn-card {\n      @apply bg-red-500;\n    }\n'));
  assert.ok(css.includes('      @apply h-5 rounded-4xl;'));
  assert.ok(!css.includes('rounded-xl border'));
  assert.ok(css.includes('@layer components {\n  .style-glass {\n'));
  assert.ok(css.includes('    /* MARK: No rule in glass */\n    .cn-button {}\n'));
});

test('extras are copied into the scope', () => {
  const css = deriveStyle('glass', '/* @base nova */\n& {\n  --glass-alpha: 0.7;\n}\n', base, hooks);
  assert.ok(css.includes('    /* MARK: Style extras */\n    & {\n      --glass-alpha: 0.7;\n    }\n'));
});

test('comments between blocks are dropped, multi-line too', () => {
  const own = parseOwn('/* @base nova */\n/*\n * A note.\n */\n/* One line. */\n& .cn-card {\n  @apply ring-1;\n}\n');
  assert.deepEqual(own.rules, []);
  assert.deepEqual(own.extras, ['& .cn-card {', '  @apply ring-1;', '}']);
});

test('a selector list is an extra, even when its last line looks like a rule', () => {
  const own = parseOwn('/* @base nova */\n.cn-badge,\n.cn-card {\n  @apply ring-1;\n}\n');
  assert.deepEqual(own.rules, []);
  assert.deepEqual(own.extras, ['.cn-badge,', '.cn-card {', '  @apply ring-1;', '}']);
});

test('unknown hook fails', () => {
  assert.throws(() => deriveStyle('glass', '/* @base nova */\n.cn-nope {\n}\n', base, hooks), /unknown hook \.cn-nope/);
});

test('missing @base fails', () => {
  assert.throws(() => parseOwn('.cn-card {\n}\n'), /first line must be/);
});

test('every own style file is up to date', () => {
  const ui = uiHooks();
  for (const file of (existsSync(OWN) ? readdirSync(OWN) : []).filter((f) => f.endsWith('.css'))) {
    const name = file.slice(0, -4);
    const own = readFileSync(join(OWN, file), 'utf8').replaceAll('\r\n', '\n');
    const baseCss = readFileSync(join(STYLES, `style-${parseOwn(own).base}.css`), 'utf8').replaceAll('\r\n', '\n');
    const onDisk = readFileSync(join(STYLES, `style-${name}.css`), 'utf8').replaceAll('\r\n', '\n');
    assert.equal(onDisk, deriveStyle(name, own, baseCss, ui), `run: node tools/styles/derive.ts ${name}`);
  }
});

/** A block of the derived glass file, from its first line to the matching close. */
function block(css: string, start: string): string {
  const from = css.indexOf(start);
  assert.ok(from >= 0, `missing: ${start}`);
  let depth = 0;
  for (let i = from; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(from, i + 1);
  }
  return css.slice(from);
}

// Every glass tint is a token, so the fallbacks only change tokens; in dark mode too.
test('glass has solid fallbacks, light and dark', () => {
  const css = readFileSync(join(STYLES, 'style-glass.css'), 'utf8');
  for (const start of ['@supports not (backdrop-filter', '@media (prefers-reduced-transparency: reduce)']) {
    const fallback = block(css, start);
    assert.match(fallback, /&,\s*\.dark & \{/, start);
    assert.match(fallback, /--glass-alpha: 1;/, start);
    assert.match(fallback, /--glass-float-alpha: 1;/, start);
    assert.match(fallback, /--glass-control: var\(--background\);/, start);
  }
});

// A lone `.cn-x {` replaces nova's whole rule, layout included (a brutal sheet once lost `fixed`).
// Today every own style only adds; a style that needs a replace rule lists the hook here.
const REPLACE_OK: Record<string, string[]> = {};

test('own styles have no accidental replace rules', () => {
  for (const file of readdirSync(OWN).filter((f) => f.endsWith('.css'))) {
    const own = parseOwn(readFileSync(join(OWN, file), 'utf8').replaceAll('\r\n', '\n'));
    const name = file.slice(0, -4);
    assert.deepEqual(own.rules.map((r) => r.hook).filter((h) => !(REPLACE_OK[name] ?? []).includes(h)), [], name);
  }
});

test('mono takes font and radius from the theme like every style (the user picks them)', () => {
  const css = readFileSync(join(STYLES, 'style-mono.css'), 'utf8');
  assert.doesNotMatch(css, /--radius:\s*0/);
  assert.doesNotMatch(css, /font-family:\s*var\(--font-mono\)/);
});

// Every look-bearing part of every component, so an own style cannot ship half done.
// Each own style must style each of these hooks in its own file (alone or in a selector list).
const LOOK_HOOKS = [
  // Surfaces and overlays
  'card', 'card-title', 'popover-content', 'dialog-content', 'dialog-overlay', 'alert-dialog-content', 'sheet-content', 'sheet-overlay',
  'drawer-content', 'hover-card-content', 'dropdown-menu-content', 'select-content', 'combobox-content', 'command', 'tooltip-content',
  'navigation-menu-viewport', 'sidebar-inner', 'alert', 'toast', 'item-variant-outline', 'empty', 'chart-tooltip',
  // Controls
  'button-variant-default', 'button-variant-outline', 'button-variant-secondary', 'button-variant-ghost', 'input', 'textarea',
  'input-group', 'select-trigger', 'native-select', 'input-otp-slot', 'checkbox', 'radio-group-item', 'switch', 'switch-thumb',
  'slider-track', 'slider-range', 'slider-thumb', 'progress', 'progress-indicator', 'toggle', 'toggle-group-item',
  // Items and selection
  'dropdown-menu-item', 'select-item', 'combobox-item', 'command-item', 'sidebar-menu-button', 'navigation-menu-trigger',
  'menubar-trigger', 'pagination-link', 'tabs-list', 'tabs-trigger', 'calendar-day-button',
  // Data and small parts
  'table-head', 'table-row', 'badge', 'avatar', 'accordion-item', 'kbd', 'skeleton', 'field-separator-content',
];
/** Styles that change little beyond nova (mono: flat hairlines, a caret); nova's rules fit them as they are. */
const SHAPE_ONLY = ['mono'];

test('every own style covers every look-bearing hook', () => {
  for (const file of readdirSync(OWN).filter((f) => f.endsWith('.css'))) {
    const name = file.slice(0, -4);
    if (SHAPE_ONLY.includes(name)) continue;
    const own = readFileSync(join(OWN, file), 'utf8');
    const missing = LOOK_HOOKS.filter((h) => !new RegExp(String.raw`\.cn-${h}(?![\w-])`).test(own));
    assert.deepEqual(missing, [], name);
  }
});

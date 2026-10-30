import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStyle } from './sync.ts';

const shadcn = `.style-maia {
  /* MARK: Badge */
  .cn-badge {
    @apply h-5 rounded-4xl;
  }

  /* MARK: Button */
  .cn-button {
    @apply rounded-4xl border;
  }

  .cn-button-size-sm {
    @apply h-8
      gap-1;
  }

  .cn-button-size-lg {
    @apply h-10;
  }
}
`;

test('keeps only used hooks, in shadcn order, with their MARK', () => {
  const css = buildStyle('maia', shadcn, new Set(['cn-button-size-sm', 'cn-button']));
  assert.ok(css.includes('@layer components {\n  .style-maia {\n    /* MARK: Button */\n    .cn-button {\n      @apply rounded-4xl border;\n    }\n'));
  assert.ok(css.includes('    .cn-button-size-sm {\n      @apply h-8\n        gap-1;\n    }\n'));
  assert.ok(!css.includes('cn-badge'));
  assert.ok(!css.includes('cn-button-size-lg'));
  assert.ok(!css.includes('MARK: Badge'));
  assert.ok(css.indexOf('.cn-button {') < css.indexOf('.cn-button-size-sm {'));
});

test('hooks the style has no rule for get an empty rule', () => {
  const css = buildStyle('maia', shadcn, new Set(['cn-button', 'cn-button-size-xs']));
  assert.ok(css.includes('    /* MARK: No rule in maia */\n    .cn-button-size-xs {}\n'));
});

test('names the shadcn source in the header', () => {
  assert.match(buildStyle('maia', shadcn, new Set()), /registry\/styles\/style-maia\.css/);
});

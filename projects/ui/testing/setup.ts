// Vitest setup for the ui specs (angular.json → test.options.setupFiles).
import axe from 'axe-core';
import { expect, vi } from 'vitest';

// axe and first-time component compiles take seconds when 60 spec files run in parallel; 5 s flaked in the full gate.
vi.setConfig({ testTimeout: 20_000 });

expect.extend({
  async toHaveNoViolations(received: Element) {
    // jsdom has no layout, so contrast cannot be measured. It cannot run axe inside an iframe either:
    // a framed page (the docs /preview routes) gets its own spec.
    const { violations } = await axe.run(received, { iframes: false, rules: { 'color-contrast': { enabled: false } } });
    return {
      pass: violations.length === 0,
      message: () =>
        violations.length === 0
          ? 'expected axe violations, found none'
          : violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`).join('\n'),
    };
  },
});

// Vitest setup for the ui specs (angular.json → test.options.setupFiles).
import axe from 'axe-core';
import { expect } from 'vitest';

expect.extend({
  async toHaveNoViolations(received: Element) {
    // jsdom has no layout, so contrast cannot be measured.
    const { violations } = await axe.run(received, { rules: { 'color-contrast': { enabled: false } } });
    return {
      pass: violations.length === 0,
      message: () =>
        violations.length === 0
          ? 'expected axe violations, found none'
          : violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`).join('\n'),
    };
  },
});

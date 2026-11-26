import { TestBed } from '@angular/core/testing';
import type { Type } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { DocsHeroMark } from './hero-mark';
import { DocsLineSignals } from './signals';
import { DocsLineInstall } from './install';
import { DocsLineThemes } from './themes';
import { DocsLineKeys } from './keys';
import { DocsLineAgents } from './agents';
import { DocsLineLost } from './lost';

const DRAWINGS: [string, Type<unknown>, string][] = [
  ['hero mark', DocsHeroMark, 'The Ivorie mark drawn as a vector outline with anchor points'],
  ['signals', DocsLineSignals, 'A parent component and a switch bound both ways with a signal'],
  ['install', DocsLineInstall, 'One source splits into the npm package or copied files in your app'],
  ['themes', DocsLineThemes, 'Three stacked layers: markup, style hooks and a theme file'],
  ['keys', DocsLineKeys, 'Focus moves through menu items with the arrow keys'],
  ['agents', DocsLineAgents, 'An agent connects to the Ivorie MCP server, which reads the docs'],
  ['lost', DocsLineLost, 'A path of nodes with one segment missing'],
];

async function render(type: Type<unknown>) {
  const fixture = TestBed.createComponent(type);
  if (type === DocsHeroMark) fixture.componentRef.setInput('count', 61);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('line-art', () => {
  it.each(DRAWINGS)('%s renders one labelled svg', async (_, type, label) => {
    const svgs = (await render(type)).querySelectorAll('svg[role="img"]');
    expect(svgs.length).toBe(1);
    expect(svgs[0].getAttribute('aria-label')).toBe(label);
  });

  it.each(DRAWINGS)('%s uses only theme colors', async (_, type) => {
    const el = await render(type);
    const colors = [...el.querySelectorAll('svg, svg *')].flatMap((n) => [n.getAttribute('fill'), n.getAttribute('stroke')]).filter(Boolean);
    expect(colors.filter((c) => /^(#|rgb|oklch|hsl)/.test(c!))).toEqual([]);
  });

  it.each(DRAWINGS)('%s keeps hairlines thin', async (_, type) => {
    const widths = [...(await render(type)).querySelectorAll('[stroke-width]')].map((n) => Number(n.getAttribute('stroke-width')));
    expect(widths.length).toBeGreaterThan(0);
    for (const w of widths) expect(w).toBeLessThanOrEqual(1.25);
  });

  it.each(DRAWINGS)('%s has no axe violations', async (_, type) => {
    await expect(await render(type)).toHaveNoViolations();
  });

  it('the hero mark caption states the part count', async () => {
    expect((await render(DocsHeroMark)).textContent).toContain('61 parts');
  });
});

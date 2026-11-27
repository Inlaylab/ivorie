import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEME_ORDER } from '../../generated/looks';
import HomePage from './home';
import { PAGES } from '../../generated/pages';
import { BLOCKS } from '../../generated/blocks';
import { CHANGELOG } from '../../generated/changelog';

const componentCount = PAGES.filter((p) => p.section === 'component').length;

async function render() {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }),
  });
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(HomePage);
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, fixture };
}

describe('HomePage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
  });

  it('a theme choice changes only the stages: the wall and the code example', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="home-theme"][value="midnight"]')!.click();
    await fixture.whenStable();
    const stages = [...el.querySelectorAll<HTMLElement>('.docs-stage')];
    expect(stages.length).toBe(2);
    for (const stage of stages) {
      expect(stage.classList).toContain('theme-midnight');
      expect(stage.style.getPropertyValue('--primary')).not.toBe('');
    }
    expect(document.body.classList).not.toContain('theme-midnight');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('each theme is a light chip: its name and three dots in its own colors, no live parts; no preset command', async () => {
    const { el } = await render();
    expect([...el.querySelectorAll<HTMLInputElement>('input[name="home-theme"]')].map((i) => i.value)).toEqual([...THEME_ORDER]);
    const chips = [...el.querySelectorAll<HTMLElement>('[data-testid="theme-chip"]')];
    expect(chips.map((c) => c.dataset['theme'])).toEqual([...THEME_ORDER]);
    for (const chip of chips) {
      const dots = chip.querySelector<HTMLElement>('[data-testid="theme-dots"]')!;
      expect(dots.style.getPropertyValue('--primary')).not.toBe('');
      expect(dots.querySelectorAll('.docs-theme-dot').length).toBe(3);
      expect(chip.querySelector('button, [role="switch"]')).toBeNull();
      const name = chip.dataset['theme']!;
      expect(chip.textContent!.trim()).toBe(name[0].toUpperCase() + name.slice(1));
    }
    expect(el.querySelector('[data-testid="theme-preview"]')).toBeNull();
    const midnight = el.querySelector<HTMLInputElement>('input[name="home-theme"][value="midnight"]')!;
    expect(midnight.getAttribute('aria-description')).toBe('Deep panes and hairlines; the accent shows as light.');
    expect(el.querySelector('[data-testid="home-command"]')).toBeNull();
  });

  it('shows the wall of live cards and a link to every component', async () => {
    const { el } = await render();
    expect(el.querySelectorAll('docs-scene-wall iv-card').length).toBe(27);
    // The rich parts lead, right after the specimen and the controls.
    const order = [...el.querySelectorAll('docs-scene-wall iv-card[data-testid]')].map((c) => c.getAttribute('data-testid'));
    expect(order.slice(0, 6)).toEqual(['wall-specimen', 'wall-controls', 'wall-overview', 'wall-status', 'wall-usage', 'wall-top-pages']);
    expect(el.querySelectorAll('[data-testid="wall-status"] iv-tracker').length).toBe(2);
    expect(el.querySelectorAll('[data-testid="wall-usage"] [role="meter"]').length).toBe(2);
    expect(el.querySelectorAll('docs-scene-wall iv-chart').length).toBe(0);
    expect(el.querySelector('a[href="/docs/components"]')!.textContent).toMatch(/Browse all \d+ components/);
  });

  it('the hero has the install command, the wall section has the theme picker, and no iframe', async () => {
    const { el } = await render();
    const hero = el.querySelector('section[aria-labelledby="hero-title"]')!;
    expect(hero.querySelector('[data-testid="hero-command"]')!.textContent).toContain('npx ivorie@1.6 init');
    expect(el.querySelector('section[aria-labelledby="wall-title"] docs-theme-picker')).not.toBeNull();
    expect(el.querySelectorAll('docs-theme-picker').length).toBe(1);
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.querySelector('[data-testid="theme-dock"]')).toBeNull();
  });

  it('the wall section keeps the theme tiles, the same-code line and the links to components and the playground', async () => {
    const { el } = await render();
    const wall = el.querySelector('section[aria-labelledby="wall-title"]')!;
    expect(wall.querySelector('[data-testid="wall-stage"] docs-scene-wall')).not.toBeNull();
    expect(wall.querySelector('[data-testid="same-code"]')).not.toBeNull();
    const hrefs = [...wall.querySelectorAll('a[href^="/"]:not(.docs-stage *)')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/docs/components', '/playground']);
    expect(el.querySelector('[data-testid="hero-stage"], app-dashboard-01, [aria-label="Block"]')).toBeNull();
  });

  it('code beside its result: each tab shows the real source and the live demo', async () => {
    const { el, fixture } = await render();
    const section = el.querySelector('section[aria-labelledby="code-title"]')!;
    const tabs = [...section.querySelectorAll<HTMLInputElement>('[role="radiogroup"] input')];
    expect(tabs.map((t) => t.value)).toEqual(['button', 'dialog', 'data-table']);
    await vi.waitFor(() => expect(section.querySelector('[data-testid="code-source"]')!.textContent).toContain('ivButton'));
    expect(section.querySelector('[data-testid="code-result"] demo-button')).not.toBeNull();
    tabs[1].click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(section.querySelector('[data-testid="code-result"] demo-dialog')).not.toBeNull());
    expect(section.querySelector('[data-testid="code-command"]')!.textContent).toContain('add dialog');
  });

  it('the keyboard section lights the key you press in its live command menu', async () => {
    const { el, fixture } = await render();
    const band = el.querySelector('section[aria-labelledby="keys-title"]')!;
    const input = band.querySelector('iv-command input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(band.querySelector('kbd[data-key="ArrowDown"]')!.hasAttribute('data-pressed')).toBe(true);
    expect(band.querySelector('kbd[data-key="Enter"]')!.hasAttribute('data-pressed')).toBe(false);
  });

  it('the line over the hero is the latest release, linked to its notes', async () => {
    const { el } = await render();
    const release = el.querySelector<HTMLAnchorElement>('[data-testid="release"]')!;
    expect(release.textContent).toContain(`v${CHANGELOG[0].version}`);
    expect(release.textContent).toContain(CHANGELOG[0].title);
    expect(release.getAttribute('href')).toBe(`/changelog#v${CHANGELOG[0].version.replaceAll('.', '-')}`);
  });

  it('the same code sits outside the stage, so it never restyles', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="home-theme"][value="mono"]')!.click();
    await fixture.whenStable();
    const chip = el.querySelector('[data-testid="same-code"]')!;
    expect(chip.textContent).toContain('<button ivButton>Save</button>');
    expect(chip.closest('.docs-stage')).toBeNull();
  });

  it('the h1 names Angular components; the hero states the component and theme counts', async () => {
    const { el } = await render();
    const h1 = el.querySelector('h1')!.textContent!;
    expect(h1).toMatch(/Angular/);
    expect(h1).toMatch(/components/);
    const sub = el.querySelector('[data-testid="hero-sub"]')!.textContent!;
    expect(sub).toContain(`${componentCount} components`);
    expect(sub).toContain(`${THEME_ORDER.length} themes`);
  });

  it('has nine sections in order: hero, wall, how it works, keyboard, numbers, code, families, next, close', async () => {
    const { el } = await render();
    const ids = [...el.querySelectorAll('section[aria-labelledby]')].map((s) => s.getAttribute('aria-labelledby'));
    expect(ids).toEqual(['hero-title', 'wall-title', 'how-title', 'keys-title', 'numbers-title', 'code-title', 'families-title', 'next-title', 'close-title']);
  });

  it('how it works has four drawn ideas', async () => {
    const { el } = await render();
    const cells = [...el.querySelectorAll('section[aria-labelledby="how-title"] .docs-cells > *')];
    expect(cells.length).toBe(4);
    expect(cells.map((c) => c.querySelector('h3')!.textContent!.trim())).toEqual(['Signals in, signals out', 'Install it, or own it', 'One markup, eleven looks', 'Keyboard first, axe checked']);
    for (const c of cells) expect(c.querySelectorAll('svg[role="img"]').length).toBe(1);
  });

  it('line-art never takes the wall theme', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="home-theme"][value="midnight"]')!.click();
    await fixture.whenStable();
    const art = [...el.querySelectorAll('docs-hero-mark, docs-line-signals, docs-line-install, docs-line-themes, docs-line-keys, docs-line-agents')];
    expect(art.length).toBe(6);
    for (const a of art) {
      expect(a.closest('.docs-stage')).toBeNull();
      expect([...a.classList].some((c) => c.startsWith('theme-'))).toBe(false);
    }
  });

  it('the next section points to 1.7 agents', async () => {
    const { el } = await render();
    const next = el.querySelector('section[aria-labelledby="next-title"]')!;
    expect(next.textContent).toContain('1.7');
    expect(next.querySelector('docs-line-agents')).not.toBeNull();
    expect(next.querySelector('a[href="/changelog"]')).not.toBeNull();
  });

  it('the hero has the release line, one action and the wall links, and no decoration: no beam, glow, blur or gradient', async () => {
    const { el } = await render();
    const hero = el.querySelector('section[aria-labelledby="hero-title"]')!;
    expect([...hero.querySelectorAll('a[href^="/"]:not(.docs-stage *)')].map((a) => a.getAttribute('href')!.split('#')[0])).toEqual(['/changelog', '/docs/installation']);
    expect(hero.querySelector('docs-hero-mark')).not.toBeNull();
    // Inside the wall, demo content (a product photo placeholder) may use a gradient; the page itself may not.
    expect(el.querySelector(':is([class*="beam"], [class*="glow"], [class*="blur"], [class*="gradient"]):not(.docs-stage *)')).toBeNull();
  });

  it('the numbers strip comes from the data: components, themes, blocks, zone.js', async () => {
    const { el } = await render();
    const cells = [...el.querySelectorAll('section[aria-labelledby="numbers-title"] [data-testid="number"]')];
    expect(cells.map((c) => c.querySelector('dt')!.textContent!.trim())).toEqual(['Components', 'Themes', 'Blocks', 'zone.js']);
    expect(cells.map((c) => c.querySelector('dd')!.textContent!.trim())).toEqual([String(componentCount), String(THEME_ORDER.length), String(BLOCKS.length), '0']);
  });

  it('the close links Buy Me a Coffee', async () => {
    const { el } = await render();
    const coffee = el.querySelector('section[aria-labelledby="close-title"] [data-testid="coffee"]')!;
    expect(coffee.getAttribute('href')).toBe('https://buymeacoffee.com/bhavikbhensajaliya');
    expect(coffee.getAttribute('rel')).toBe('noreferrer');
  });

  it('has no axe violations in dark mode', async () => {
    document.documentElement.classList.add('dark');
    try {
      const { el } = await render();
      await expect(el).toHaveNoViolations();
    } finally {
      document.documentElement.classList.remove('dark');
    }
  }, 60_000);

  // The whole wall plus eleven themed tiles: axe needs longer than the default, as on the preview page.
  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  }, 60_000);
});

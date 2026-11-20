import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { THEMES, THEME_ORDER, type ThemeName } from '../../generated/looks';
import HomePage from './home';
import { PAGES } from '../../generated/pages';

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

  it('a theme choice changes only the wall stage', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="home-theme"][value="midnight"]')!.click();
    await fixture.whenStable();
    const stage = el.querySelector<HTMLElement>('.docs-stage')!;
    expect(stage.classList).toContain('theme-midnight');
    expect(stage.style.getPropertyValue('--primary')).not.toBe('');
    expect(document.body.classList).not.toContain('theme-midnight');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('each theme is a live preview in its own style and colors, Ivorie then Classic; no preset command', async () => {
    const { el } = await render();
    expect([...el.querySelectorAll<HTMLInputElement>('input[name="home-theme"]')].map((i) => i.value)).toEqual([...THEME_ORDER]);
    const tiles = [...el.querySelectorAll<HTMLElement>('[data-testid="theme-preview"]')];
    expect(tiles.map((t) => t.dataset['theme'])).toEqual([...THEME_ORDER]);
    for (const tile of tiles) {
      expect(tile.classList).toContain(`theme-${THEMES[tile.dataset['theme'] as ThemeName].theme}`);
      expect(tile.style.getPropertyValue('--primary')).not.toBe('');
      // Real parts in the theme, not a picture of it.
      expect(tile.querySelector('button')!.textContent!.trim()).toBe('Save');
      expect(tile.querySelector('[role="switch"]')).not.toBeNull();
      expect(tile.closest('label')!.querySelector('.docs-theme-name')!.textContent!.trim()).toBe(tile.dataset['theme']![0].toUpperCase() + tile.dataset['theme']!.slice(1));
    }
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

  it('the hero has the install command, and no product window', async () => {
    const { el } = await render();
    expect(el.querySelector('[data-testid="hero-command"]')!.textContent).toContain('npx ivorie@1.6 init');
    expect(el.querySelector('iframe')).toBeNull();
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

  it('has six sections in order: hero, what it does, why, themes, two ways in, close', async () => {
    const { el } = await render();
    const ids = [...el.querySelectorAll('section[aria-labelledby]')].map((s) => s.getAttribute('aria-labelledby'));
    expect(ids).toEqual(['hero-title', 'does-title', 'why-title', 'themes-title', 'ways-title', 'close-title']);
  });

  it('the hero specimen sets the same live button in five themes', async () => {
    const { el } = await render();
    const rows = [...el.querySelectorAll<HTMLElement>('[data-testid="specimen"] [data-theme]')];
    expect(rows.length).toBe(5);
    for (const row of rows) {
      expect(row.classList).toContain(`theme-${row.dataset['theme']}`);
      expect([...row.querySelectorAll('button')].map((b) => b.textContent!.trim())).toContain('Save changes');
    }
  });

  it('the hero has two actions and no decoration: no beam, glow, blur or gradient', async () => {
    const { el } = await render();
    const hero = el.querySelector('section[aria-labelledby="hero-title"]')!;
    expect(hero.querySelectorAll('a[routerLink], a[href^="/"]').length).toBe(2);
    // Inside the wall, demo content (a product photo placeholder) may use a gradient; the page itself may not.
    expect(el.querySelector(':is([class*="beam"], [class*="glow"], [class*="blur"], [class*="gradient"]):not(.docs-stage *)')).toBeNull();
  });

  it('why it helps lists six concrete benefits', async () => {
    const { el } = await render();
    expect(el.querySelectorAll('section[aria-labelledby="why-title"] dt').length).toBe(6);
  });

  // The whole wall plus eleven themed tiles: axe needs longer than the default, as on the preview page.
  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  }, 60_000);
});

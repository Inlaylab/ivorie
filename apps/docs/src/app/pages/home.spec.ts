import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import HomePage from './home';

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

  it('a style choice changes only the wall stage', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="home-style"][value="lyra"]')!.click();
    await fixture.whenStable();
    const stage = el.querySelector<HTMLElement>('.docs-stage')!;
    expect(stage.classList).toContain('style-lyra');
    expect(stage.style.getPropertyValue('--primary')).not.toBe('');
    expect(document.body.classList).not.toContain('style-lyra');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('each style explains itself in a tooltip; no preset command on the home page', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="home-style"][value="glass"]')!.click();
    await fixture.whenStable();
    const glass = el.querySelector<HTMLInputElement>('input[name="home-style"][value="glass"]')!;
    expect(glass.getAttribute('aria-description')).toBe('Frosted neutral glass, edges drawn with light.');
    expect(el.querySelectorAll('iv-tooltip-content').length).toBe(11);
    expect(el.querySelector('[data-testid="home-command"]')).toBeNull();
  });

  it('an accent colors the stage primary and charts, not the page', async () => {
    const { el, fixture } = await render();
    const stage = el.querySelector<HTMLElement>('.docs-stage')!;
    const grey = stage.style.getPropertyValue('--chart-1');
    el.querySelector<HTMLInputElement>('input[name="home-accent"][value="blue"]')!.click();
    await fixture.whenStable();
    expect(el.querySelectorAll('input[name="home-accent"]').length).toBe(18);
    // Blue in either mode: light 264.376, dark 265.638.
    expect(stage.style.getPropertyValue('--primary')).toMatch(/^oklch\(0\.\d+ 0\.\d+ 26[45]\.\d+\)$/);
    expect(stage.style.getPropertyValue('--chart-1')).not.toBe(grey);
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('shows the wall of live cards and a link to every component', async () => {
    const { el } = await render();
    expect(el.querySelectorAll('docs-scene-wall iv-card').length).toBe(19);
    expect(el.querySelectorAll('docs-scene-wall iv-chart').length).toBe(0);
    expect(el.querySelector('a[href="/docs/components"]')!.textContent).toMatch(/Browse all \d+ components/);
  });

  it('the hero has the install command, and no product window', async () => {
    const { el } = await render();
    expect(el.querySelector('[data-testid="hero-command"]')!.textContent).toContain('npx ivorie init');
    expect(el.querySelector('iframe')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});

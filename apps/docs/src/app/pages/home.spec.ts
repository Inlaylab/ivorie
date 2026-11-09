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
    el.querySelector<HTMLInputElement>('input[name="home-style"][value="brutal"]')!.click();
    await fixture.whenStable();
    const stage = el.querySelector<HTMLElement>('.docs-stage')!;
    expect(stage.classList).toContain('style-brutal');
    expect(stage.style.getPropertyValue('--primary')).not.toBe('');
    expect(document.body.classList).not.toContain('style-brutal');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('each style explains itself in a tooltip; no preset command on the home page', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="home-style"][value="glass"]')!.click();
    await fixture.whenStable();
    const glass = el.querySelector<HTMLInputElement>('input[name="home-style"][value="glass"]')!;
    expect(glass.getAttribute('aria-description')).toBe('Frosted, see-through surfaces.');
    expect(el.querySelectorAll('iv-tooltip-content').length).toBe(10);
    expect(el.querySelector('[data-testid="home-command"]')).toBeNull();
  });

  it('shows the wall of live cards and a link to every component', async () => {
    const { el } = await render();
    expect(el.querySelectorAll('docs-scene-wall iv-card').length).toBe(15);
    expect(el.querySelector('a[href="/docs/components"]')!.textContent).toMatch(/Browse all \d+ components/);
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});

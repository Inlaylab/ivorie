import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import HomePage from './home';

async function render() {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
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

  it('a style or color choice changes only the preview box', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[aria-label="Mauve"]')!.click();
    el.querySelector<HTMLInputElement>('input[name="home-style"][value="nova"]')!.click();
    await fixture.whenStable();
    const stage = el.querySelector<HTMLElement>('.docs-stage')!;
    expect(stage.classList).toContain('style-nova');
    expect(stage.style.getPropertyValue('--primary')).not.toBe('');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
    expect(el.querySelector('a[href^="/playground?preset=ivp1_"]')).not.toBeNull();
  });

  it('the install command follows the picked style', async () => {
    const { el, fixture } = await render();
    const command = () => el.querySelector('[data-testid="home-command"]')!.textContent!.trim();
    expect(command()).toBe('$ npx ivorie init');
    el.querySelector<HTMLInputElement>('input[name="home-style"][value="glass"]')!.click();
    await fixture.whenStable();
    expect(command()).toMatch(/^\$ npx ivorie init --preset ivp1_/);
    expect(el.querySelector('[data-testid="style-note"]')!.textContent!.trim()).toBe(
      'Frosted, see-through surfaces.',
    );
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});

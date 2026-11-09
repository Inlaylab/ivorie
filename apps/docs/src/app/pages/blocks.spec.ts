import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import BlocksPage from './blocks';

async function render(url = '/blocks') {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'blocks', component: BlocksPage }])] });
  const harness = await RouterTestingHarness.create(url);
  await harness.fixture.whenStable();
  return { el: harness.routeNativeElement!, harness };
}

const titles = (el: HTMLElement) => [...el.querySelectorAll('docs-block-showcase h2')].map((h) => h.textContent!.trim());

describe('BlocksPage', () => {
  it('opens on Featured: one block per kind', async () => {
    const { el } = await render();
    expect(el.querySelector('h1')!.textContent).toContain('Blocks');
    expect(el.querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('Featured');
    expect(titles(el)).toEqual(['Login 01', 'Signup 01', 'Sidebar 01', 'Dashboard 01']);
  });

  it('a category tab filters the blocks and lives in the URL', async () => {
    const { el } = await render('/blocks?category=login');
    expect(el.querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('Login');
    expect(titles(el)).toEqual(['Login 01', 'Login 02', 'Login 03', 'Login 04', 'Login 05']);
    expect(el.querySelector('a[href="/blocks?category=sidebar"]')).not.toBeNull();
  });

  it('an unknown category gives Featured', async () => {
    const { el } = await render('/blocks?category=nope');
    expect(titles(el).length).toBe(4);
  });

  it('each block has a toolbar: view, open, reload and its add command', async () => {
    const { el, harness } = await render();
    const first = el.querySelector('docs-block-showcase')!;
    expect(first.querySelector('[data-testid="command"]')!.textContent!.trim()).toBe('npx ivorie add login-01');
    expect(first.querySelector('[data-testid="open"]')!.getAttribute('href')).toMatch(/^preview\/block\/login-01\?preset=ivp1_/);
    expect(first.querySelector('[data-testid="reload"]')).not.toBeNull();
    first.querySelector<HTMLInputElement>('input[name="login-01-view"][value="code"]')!.click();
    await harness.fixture.whenStable();
    await new Promise((r) => setTimeout(r, 50));
    await harness.fixture.whenStable();
    expect([...first.querySelectorAll('[data-testid="file"]')].map((f) => f.textContent!.trim())).toEqual([
      'components/login-form.ts',
      'login-01.ts',
    ]);
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});

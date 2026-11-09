import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it, vi } from 'vitest';
import BlockPage from './block';

async function render(name = 'login-01') {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }),
  });
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'blocks/:name', component: BlockPage }])] });
  const harness = await RouterTestingHarness.create(`/blocks/${name}`);
  await harness.fixture.whenStable();
  return { el: harness.routeNativeElement!, fixture: harness.fixture };
}

describe('BlockPage', () => {
  it('a block page shows its frame, command and files', async () => {
    const { el, fixture } = await render();
    expect(el.querySelector('h1')!.textContent).toContain('Login 01');
    expect(el.querySelector('iframe')!.getAttribute('src')).toMatch(/^preview\/block\/login-01\?preset=/);
    expect(el.querySelector('[data-testid="command"]')!.textContent!.trim()).toBe('npx ivorie add login-01');
    [...el.querySelectorAll<HTMLElement>('[role="tab"]')].find((t) => t.textContent!.trim() === 'Code')!.click();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 50));
    await fixture.whenStable();
    const files = [...el.querySelectorAll('[data-testid="file"]')].map((f) => f.textContent!.trim());
    expect(files).toEqual(['components/login-form.ts', 'login-01.ts']);
  });

  it('auth blocks list their inputs and outputs', async () => {
    const { el } = await render();
    const api = el.querySelector('[data-testid="api"]')!.textContent!;
    for (const name of ['pending', 'error', 'submitted', 'provider']) expect(api).toContain(name);
  });

  it('the style picker reaches the frame', async () => {
    const { el, fixture } = await render();
    const frame = el.querySelector('iframe')!;
    const post = vi.spyOn(frame.contentWindow!, 'postMessage');
    el.querySelector<HTMLInputElement>('input[name="block-style"][value="glass"]')!.click();
    await fixture.whenStable();
    expect(post).toHaveBeenCalledWith({ type: 'ivorie-look', preset: expect.stringMatching(/^ivp1_/) }, location.origin);
  });

  it('an unknown block says so', async () => {
    const { el } = await render('nope');
    expect(el.textContent).toContain('Unknown block');
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});

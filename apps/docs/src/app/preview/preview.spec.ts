import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../app';
import { routes } from '../app.routes';
import { DEFAULT_PRESET, encodePreset } from '../playground/preset-code';

const glass = encodePreset({ ...DEFAULT_PRESET, style: 'glass' });
const maia = encodePreset({ ...DEFAULT_PRESET, style: 'maia' });

/** The whole site at a URL: App with its shell, routed like the real thing. */
async function open(url: string) {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }),
  });
  document.body.className = 'style-nova';
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const fixture = TestBed.createComponent(App);
  await TestBed.inject(Router).navigateByUrl(url);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, fixture };
}

function post(origin: string, preset: string) {
  window.dispatchEvent(new MessageEvent('message', { origin, data: { type: 'ivorie-look', preset } }));
  TestBed.tick();
}

describe('PreviewPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.body.className = '';
    document.body.removeAttribute('style');
    localStorage.clear();
  });

  it('renders the scene with no site chrome', async () => {
    const { el } = await open(`/preview/scene/team?preset=${glass}`);
    expect(el.querySelector('docs-scene-team')).not.toBeNull();
    expect(el.querySelector('docs-site-header')).toBeNull();
  }, 60_000);

  it('the look is on body, in place of the site style', async () => {
    await open(`/preview/scene/dashboard?preset=${glass}`);
    expect(document.body.classList.contains('style-glass')).toBe(true);
    expect(document.body.classList.contains('style-nova')).toBe(false);
  });

  it('applies a look message from the same origin', async () => {
    await open(`/preview/scene/dashboard?preset=${glass}`);
    post(location.origin, maia);
    expect(document.body.classList.contains('style-maia')).toBe(true);
  });

  it('ignores messages from other origins', async () => {
    await open(`/preview/scene/dashboard?preset=${glass}`);
    post('https://evil.test', maia);
    expect(document.body.classList.contains('style-glass')).toBe(true);
  });

  // The parent answers with its current look: a look picked before the frame listened is not lost.
  it('tells the parent it is ready once it listens', async () => {
    const post = vi.spyOn(window.parent, 'postMessage');
    await open(`/preview/scene/dashboard?preset=${glass}`);
    expect(post).toHaveBeenCalledWith({ type: 'ivorie-preview-ready' }, location.origin);
    post.mockRestore();
  });

  it('an unknown scene shows a not-found line', async () => {
    const { el } = await open('/preview/scene/nope');
    expect(el.textContent).toContain('Unknown preview');
  });

  it('other pages keep the site shell', async () => {
    const { el } = await open('/roadmap');
    expect(el.querySelector('docs-site-header')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { el } = await open('/preview/scene/sign-in');
    await expect(el).toHaveNoViolations();
  });
});

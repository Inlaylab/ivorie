import { TestBed } from '@angular/core/testing';
import { Router, UrlSerializer, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { SITE_DESCRIPTION, TrailingSlashUrlSerializer, routes } from './app.routes';

async function open(url: string) {
  // /all renders every demo; the sidebar demos' BreakpointObserver needs the old addListener API too.
  // Other specs leave a partial matchMedia behind (no isolation), so set a full one here.
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }),
  });
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes, withComponentInputBinding()),
      { provide: UrlSerializer, useClass: TrailingSlashUrlSerializer },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return { harness, el: harness.routeNativeElement as HTMLElement, url: TestBed.inject(Router).url };
}

// Odd slugs show the right page or the not-found page, never crash.
describe('docs routes', () => {
  it('serves /docs/tabs/ (trailing slash) as the tabs page', async () => {
    const { el } = await open('/docs/tabs/');
    expect(el.querySelector('h1')?.textContent).toContain('Tabs');
  }, 300_000); // First lazy demo import compiles its chunk.

  it('serves /docs/components as the components index, not a doc page', async () => {
    const { el } = await open('/docs/components');
    expect(el.querySelector('h1')?.textContent).toContain('Components');
    expect(el.querySelector('li a[href="/docs/accordion"]')).not.toBeNull();
  });

  it('redirects /docs/Tabs to the canonical /docs/tabs (H9)', async () => {
    const { el, url } = await open('/docs/Tabs');
    expect(url).toBe('/docs/tabs');
    expect(el.querySelector('h1')?.textContent).toContain('Tabs');
  });

  it('serves /docs/nope at its own URL with the not-found view, not a redirect (H9)', async () => {
    const { el, url } = await open('/docs/nope');
    expect(url).toBe('/docs/nope');
    expect(el.querySelector('h1')?.textContent).toContain('This page does not exist');
  });

  it('leaving a doc page or /all resets the description and drops noindex', async () => {
    const { harness } = await open('/docs/tabs');
    const description = () => document.querySelector('meta[name="description"]')?.getAttribute('content');
    const robots = () => document.querySelector('meta[name="robots"]');
    expect(description()).not.toBe(SITE_DESCRIPTION);
    await harness.navigateByUrl('/');
    expect(description()).toBe(SITE_DESCRIPTION);
    await harness.navigateByUrl('/all');
    expect(robots()).not.toBeNull();
    await harness.navigateByUrl('/not-found');
    expect(robots()).toBeNull();
    expect(description()).toBe(SITE_DESCRIPTION);
  }, 120_000);
});

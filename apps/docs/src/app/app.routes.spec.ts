import { TestBed } from '@angular/core/testing';
import { Router, UrlSerializer, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { TrailingSlashUrlSerializer, routes } from './app.routes';

async function open(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes, withComponentInputBinding()),
      { provide: UrlSerializer, useClass: TrailingSlashUrlSerializer },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return { el: harness.routeNativeElement as HTMLElement, url: TestBed.inject(Router).url };
}

// Odd slugs show the right page or the not-found page, never crash.
describe('docs routes', () => {
  it('serves /docs/tabs/ (trailing slash) as the tabs page', async () => {
    const { el } = await open('/docs/tabs/');
    expect(el.querySelector('h1')?.textContent).toContain('Tabs');
  }, 120_000); // First lazy demo import compiles its chunk.

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
});

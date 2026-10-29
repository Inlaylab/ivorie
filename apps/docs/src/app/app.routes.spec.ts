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

  it('serves /docs/Tabs as the tabs page', async () => {
    const { el } = await open('/docs/Tabs');
    expect(el.querySelector('h1')?.textContent).toContain('Tabs');
  });

  it('sends /docs/nope to /not-found', async () => {
    const { url } = await open('/docs/nope');
    expect(url).toBe('/not-found');
  });
});

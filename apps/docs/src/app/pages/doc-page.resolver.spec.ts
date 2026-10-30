import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { describe, expect, it } from 'vitest';
import { type DocPageData, docPageResolver } from './doc-page.resolver';

async function resolve(slug: string, responseInit: ResponseInit = {}) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: RESPONSE_INIT, useValue: responseInit }],
  });
  const route = { paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() =>
    docPageResolver(route, {} as RouterStateSnapshot),
  ) as Promise<DocPageData | RedirectCommand | null>;
}

describe('docPageResolver', () => {
  it('loads a page and its demo types', async () => {
    const data = (await resolve('tabs')) as DocPageData;
    expect(data.page.slug).toBe('tabs');
    expect(typeof data.demos['tabs']).toBe('function');
  }, 120_000); // First lazy demo import compiles its chunk.

  it('redirects a case variant to the canonical lowercase URL, status 301 (H9)', async () => {
    const responseInit: ResponseInit = {};
    const result = await resolve('Tabs', responseInit);
    expect(result).toBeInstanceOf(RedirectCommand);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/docs/tabs');
    expect(responseInit.status).toBe(301);
  });

  it('an unknown slug resolves to null with a real 404 status, not a redirect (H9: a RedirectCommand can only carry a 3xx status)', async () => {
    const responseInit: ResponseInit = {};
    const result = await resolve('nope', responseInit);
    expect(result).toBeNull();
    expect(responseInit.status).toBe(404);
  });

  it('sets the document title', async () => {
    await resolve('tabs');
    expect(document.title).toBe('Tabs · Ivorie');
  });
});

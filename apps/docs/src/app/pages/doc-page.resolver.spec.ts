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

async function resolve(slug: string) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const route = { paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() =>
    docPageResolver(route, {} as RouterStateSnapshot),
  ) as Promise<DocPageData | RedirectCommand>;
}

describe('docPageResolver', () => {
  it('loads a page and its demo types', async () => {
    const data = (await resolve('tabs')) as DocPageData;
    expect(data.page.slug).toBe('tabs');
    expect(typeof data.demos['tabs']).toBe('function');
  }, 120_000); // First lazy demo import compiles its chunk.

  it('matches the slug case-insensitively', async () => {
    const data = (await resolve('Tabs')) as DocPageData;
    expect(data.page.slug).toBe('tabs');
  });

  it('redirects an unknown slug to /not-found', async () => {
    const result = await resolve('nope');
    expect(result).toBeInstanceOf(RedirectCommand);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
  });

  it('sets the document title', async () => {
    await resolve('tabs');
    expect(document.title).toBe('Tabs · Ivorie');
  });
});

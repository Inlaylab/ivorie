import { inject, RESPONSE_INIT, type Type } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RedirectCommand, Router, type ResolveFn } from '@angular/router';
import type { DocPage, PageEntry } from '../content/types';
import { DEMOS } from '../../generated/demos';
import { PAGES } from '../../generated/pages';

export interface DocPageData {
  page: DocPage;
  demos: Record<string, Type<unknown>>;
}

/** Loads a page module and the demo components it uses. */
export async function loadDocPage(entry: PageEntry): Promise<DocPageData> {
  const page = await entry.load();
  const names = Object.keys(page.demos);
  const types = await Promise.all(names.map((name) => DEMOS[name]()));
  return { page, demos: Object.fromEntries(names.map((name, i) => [name, types[i]])) };
}

/**
 * `/docs/:slug`, case-insensitive.
 * - Unknown slug: `null` (the component renders the not-found view at this same URL), with a real
 *   404 status. A RedirectCommand can't carry 404 — Angular only allows 3xx redirect statuses.
 * - Known slug, wrong case (e.g. `/docs/Tabs`): redirects to the canonical lowercase URL (301), so
 *   there's one URL per page.
 */
export const docPageResolver: ResolveFn<DocPageData | null> = (route) => {
  const router = inject(Router);
  const title = inject(Title);
  const meta = inject(Meta);
  const responseInit = inject(RESPONSE_INIT, { optional: true });
  const raw = route.paramMap.get('slug') ?? '';
  const slug = raw.toLowerCase();
  const entry = PAGES.find((p) => p.slug === slug);
  if (!entry) {
    if (responseInit) responseInit.status = 404;
    title.setTitle('Not found · Ivorie');
    return null;
  }
  if (raw !== slug) {
    if (responseInit) responseInit.status = 301;
    return new RedirectCommand(router.parseUrl(`/docs/${slug}`));
  }
  title.setTitle(`${entry.title} · Ivorie`);
  meta.updateTag({ name: 'description', content: entry.description });
  return loadDocPage(entry);
};

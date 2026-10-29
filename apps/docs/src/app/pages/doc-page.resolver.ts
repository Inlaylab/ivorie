import { inject, type Type } from '@angular/core';
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

/** `/docs/:slug`, case-insensitive. Unknown slugs go to /not-found. */
export const docPageResolver: ResolveFn<DocPageData> = (route) => {
  const router = inject(Router);
  const title = inject(Title);
  const meta = inject(Meta);
  const slug = (route.paramMap.get('slug') ?? '').toLowerCase();
  const entry = PAGES.find((p) => p.slug === slug);
  if (!entry) return new RedirectCommand(router.parseUrl('/not-found'));
  title.setTitle(`${entry.title} · Ivorie`);
  meta.updateTag({ name: 'description', content: entry.description });
  return loadDocPage(entry);
};

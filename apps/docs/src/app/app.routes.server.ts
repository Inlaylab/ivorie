import { RenderMode, ServerRoute } from '@angular/ssr';
import { PAGES } from '../generated/pages';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'docs/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PAGES.map((p) => ({ slug: p.slug })),
  },
  { path: 'not-found', renderMode: RenderMode.Prerender },
  // Redirect to docs/installation; must not get the 404 status of '**'.
  { path: 'docs', renderMode: RenderMode.Prerender },
  { path: 'all', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];

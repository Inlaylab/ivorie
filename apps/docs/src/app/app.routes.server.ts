import { RenderMode, ServerRoute } from '@angular/ssr';
import { PAGES } from '../generated/pages';
import { BLOCKS } from '../generated/blocks';
import { SCENES } from './playground/scenes';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'docs/components', renderMode: RenderMode.Prerender },
  { path: 'playground', renderMode: RenderMode.Prerender },
  { path: 'blocks', renderMode: RenderMode.Prerender },
  { path: 'roadmap', renderMode: RenderMode.Prerender },
  {
    path: 'docs/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PAGES.map((p) => ({ slug: p.slug })),
  },
  {
    path: 'preview/:kind/:name',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      ...SCENES.map((s) => ({ kind: 'scene', name: s.value })),
      ...BLOCKS.map((b) => ({ kind: 'block', name: b.name })),
    ],
  },
  // A block's own nav, inside the preview frame: rendered in the browser only.
  { path: 'preview/:kind/:name/**', renderMode: RenderMode.Client },
  {
    path: 'blocks/:name',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => BLOCKS.map((b) => ({ name: b.name })),
  },
  { path: 'not-found', renderMode: RenderMode.Prerender },
  // Redirect to docs/installation; must not get the 404 status of '**'.
  { path: 'docs', renderMode: RenderMode.Prerender },
  { path: 'all', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];

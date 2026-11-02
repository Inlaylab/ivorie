import { inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { DefaultUrlSerializer, ResolveFn, Routes, UrlTree } from '@angular/router';

/** Static hosts serve /docs/tabs/ as docs/tabs/index.html; the router must see /docs/tabs. */
export class TrailingSlashUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    return super.parse(url.replace(/(.)\/+(?=$|[?#])/, '$1'));
  }
}

/** Same text as the description in index.html. */
export const SITE_DESCRIPTION = 'Angular components with the shadcn/ui look and behavior.';

/** Runs before every page's own resolver: a page that sets no meta must not keep the last page's. */
const resetMeta: ResolveFn<true> = () => {
  const meta = inject(Meta);
  meta.updateTag({ name: 'description', content: SITE_DESCRIPTION });
  meta.removeTag('name="robots"');
  return true;
};

export const routes: Routes = [
  {
    path: '',
    resolve: { meta: resetMeta },
    runGuardsAndResolvers: 'always',
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home'), title: 'Ivorie · Angular components' },
      { path: 'not-found', loadComponent: () => import('./pages/not-found'), title: 'Not found · Ivorie' },
      { path: '', loadChildren: () => import('./pages/content.routes').then((m) => m.contentRoutes) },
      { path: '**', loadComponent: () => import('./pages/not-found'), title: 'Not found · Ivorie' },
    ],
  },
];

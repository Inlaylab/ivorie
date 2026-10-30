import { DefaultUrlSerializer, Routes, UrlTree } from '@angular/router';

/** Static hosts serve /docs/tabs/ as docs/tabs/index.html; the router must see /docs/tabs. */
export class TrailingSlashUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    return super.parse(url.replace(/(.)\/+(?=$|[?#])/, '$1'));
  }
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home'), title: 'Ivorie · Angular components' },
  { path: 'not-found', loadComponent: () => import('./pages/not-found'), title: 'Not found · Ivorie' },
  { path: '', loadChildren: () => import('./pages/content.routes').then((m) => m.contentRoutes) },
  { path: '**', loadComponent: () => import('./pages/not-found'), title: 'Not found · Ivorie' },
];

import { Routes } from '@angular/router';
import { provideIvToast } from '@ivorie/ui/toast';
import { allDemosResolver } from './all.resolver';
import { docPageResolver } from './doc-page.resolver';

/** Lazy: demo registry and toast host stay out of the first load. */
export const contentRoutes: Routes = [
  {
    path: '',
    providers: [provideIvToast()],
    children: [
      { path: 'docs', pathMatch: 'full', redirectTo: 'docs/installation' },
      {
        path: 'docs/:slug',
        loadComponent: () => import('./doc-page'),
        resolve: { page: docPageResolver },
      },
      {
        path: 'all',
        loadComponent: () => import('./all'),
        resolve: { demos: allDemosResolver },
        title: 'All components',
      },
    ],
  },
];

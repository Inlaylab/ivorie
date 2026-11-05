import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { provideIvToast } from '@inlaylab/ivorie/toast';
import { allDemosResolver } from './all.resolver';
import { docPageResolver } from './doc-page.resolver';

@Component({ template: '' })
class Blank {}

/** Lazy: demo registry and toast host stay out of the first load. */
export const contentRoutes: Routes = [
  {
    path: '',
    providers: [provideIvToast()],
    children: [
      { path: 'docs', pathMatch: 'full', redirectTo: 'docs/installation' },
      { path: 'docs/components', loadComponent: () => import('./components'), title: 'Components · Ivorie' },
      {
        path: 'playground',
        loadComponent: () => import('../playground/playground'),
        title: 'Playground · Ivorie',
      },
      { path: 'blocks', loadComponent: () => import('./blocks'), title: 'Blocks · Ivorie' },
      { path: 'blocks/:name', loadComponent: () => import('./block'), title: 'Block · Ivorie' },
      { path: 'roadmap', loadComponent: () => import('./roadmap'), title: 'Roadmap · Ivorie' },
      {
        path: 'preview/:kind/:name',
        loadComponent: () => import('../preview/preview'),
        title: 'Preview · Ivorie',
        // Block nav links are relative: they land here and stay inside the frame.
        children: [{ path: '**', component: Blank }],
      },
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

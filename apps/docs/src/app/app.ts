import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
// Single parts, not IV_SIDEBAR_IMPORTS: the menu button pulls the tooltip overlay into the first load.
import { IvSidebar, IvSidebarContent, IvSidebarInset, IvSidebarProvider } from '@inlaylab/ivorie/sidebar';
import { Appearance } from './shell/appearance';
import { SiteHeader } from './shell/site-header';
import { SiteNav } from './shell/site-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IvSidebar, IvSidebarContent, IvSidebarInset, IvSidebarProvider, SiteHeader, SiteNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  /** Pages with `data: { wide: true }` (the playground) use the full width. */
  protected readonly wide = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        let r = this.router.routerState.snapshot.root;
        while (r.firstChild) r = r.firstChild;
        return r.data['wide'] === true;
      }),
    ),
    { initialValue: false },
  );

  constructor() {
    // Start syncing the saved appearance with <html> and <body>.
    inject(Appearance);
  }
}

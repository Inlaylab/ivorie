import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject } from '@angular/core';
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
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    // The page URL until the first navigation ends, so the first client render matches the server.
    { initialValue: inject(DOCUMENT).location?.pathname ?? '' },
  );
  /** Only /docs pages have the sidebar; the others use the full width. Works under a base path too. */
  protected readonly docs = computed(() => /(^|\/)docs(\/|$)/.test(this.url().split(/[?#]/)[0]));
  /** /preview pages fill an iframe: no header, no sidebar. Server and client both read it from the URL. */
  protected readonly preview = computed(() => /(^|\/)preview\//.test(this.url().split(/[?#]/)[0]));

  constructor() {
    // Start syncing the saved light/dark mode with <html>.
    inject(Appearance);
  }
}

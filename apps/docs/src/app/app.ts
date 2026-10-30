import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  constructor() {
    // Start syncing the saved appearance with <html> and <body>.
    inject(Appearance);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IvSidebarGroup, IvSidebarGroupContent, IvSidebarGroupLabel, IvSidebarMenu, IvSidebarMenuItem,
  IvSidebarService,
} from '@inlaylab/ivorie/sidebar';
import { PAGES } from '../../generated/pages';

@Component({
  selector: 'docs-site-nav',
  imports: [RouterLink, RouterLinkActive, IvSidebarGroup, IvSidebarGroupContent, IvSidebarGroupLabel, IvSidebarMenu, IvSidebarMenuItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Docs">
      @for (group of groups; track group.label) {
        <iv-sidebar-group class="py-1">
          <iv-sidebar-group-label class="text-muted-foreground px-2 text-xs font-medium">{{ group.label }}</iv-sidebar-group-label>
          <iv-sidebar-group-content>
            <ul ivSidebarMenu class="gap-0.5">
              @for (page of group.pages; track page.slug) {
                <li ivSidebarMenuItem>
                  <a
                    [routerLink]="['/docs', page.slug]"
                    routerLinkActive="bg-accent !text-accent-foreground"
                    ariaCurrentWhenActive="page"
                    class="text-foreground/80 hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex h-7 items-center rounded-md px-2 text-[0.8125rem] font-medium outline-none focus-visible:ring-2"
                    (click)="closeOnMobile()"
                    >{{ page.title }}</a
                  >
                </li>
              }
            </ul>
          </iv-sidebar-group-content>
        </iv-sidebar-group>
      }
    </nav>
  `,
})
export class SiteNav {
  private readonly sidebar = inject(IvSidebarService, { optional: true });

  protected readonly groups = [
    { label: 'Getting started', pages: PAGES.filter((p) => p.section === 'guide') },
    {
      label: 'Components',
      pages: [{ slug: 'components', title: 'Overview' }, ...PAGES.filter((p) => p.section === 'component')],
    },
  ];

  protected closeOnMobile(): void {
    if (this.sidebar?.isMobile()) this.sidebar.openMobile.set(false);
  }
}

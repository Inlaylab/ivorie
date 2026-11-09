import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IvBadge } from '@inlaylab/ivorie/badge';
import {
  IvSidebarGroup, IvSidebarGroupContent, IvSidebarGroupLabel, IvSidebarMenu, IvSidebarMenuItem,
  IvSidebarService,
} from '@inlaylab/ivorie/sidebar';
import { PAGES } from '../../generated/pages';

const GROUPS = [
  { label: 'Getting started', pages: PAGES.filter((p) => p.section === 'guide') },
  {
    label: 'Components',
    pages: [{ slug: 'components', title: 'Overview', soon: false }, ...PAGES.filter((p) => p.section === 'component')],
  },
];

@Component({
  selector: 'docs-site-nav',
  imports: [RouterLink, RouterLinkActive, IvBadge, IvSidebarGroup, IvSidebarGroupContent, IvSidebarGroupLabel, IvSidebarMenu, IvSidebarMenuItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Docs" class="flex flex-col gap-2 px-2">
      <div class="relative px-1 pb-1">
        <svg class="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          aria-label="Filter pages"
          placeholder="Filter pages"
          class="bg-foreground/[0.04] placeholder:text-muted-foreground focus-visible:ring-ring/40 focus-visible:border-ring h-8 w-full rounded-full border pr-3 pl-8 text-[0.8125rem] outline-none focus-visible:ring-[3px]"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
      </div>
      @for (group of groups(); track group.label) {
        <iv-sidebar-group class="py-1">
          <iv-sidebar-group-label class="text-muted-foreground px-3 text-xs font-medium">{{ group.label }}</iv-sidebar-group-label>
          <iv-sidebar-group-content>
            <ul ivSidebarMenu class="gap-px">
              @for (page of group.pages; track page.slug) {
                <li ivSidebarMenuItem>
                  <a
                    [routerLink]="['/docs', page.slug]"
                    routerLinkActive="docs-nav-active bg-foreground/[0.07] !text-foreground"
                    ariaCurrentWhenActive="page"
                    class="text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] focus-visible:ring-ring group flex h-8 items-center gap-2 rounded-full px-3 text-[0.8125rem] font-medium transition-colors outline-none focus-visible:ring-2"
                    (click)="closeOnMobile()"
                  >
                    <!-- The brand dot marks the open page. -->
                    <span class="docs-brand-gradient hidden size-1.5 shrink-0 rounded-full group-[.docs-nav-active]:block" aria-hidden="true"></span>
                    {{ page.title }}
                    @if (page.soon) {
                      <iv-badge variant="secondary" class="ml-auto">Soon</iv-badge>
                    }
                  </a>
                </li>
              }
            </ul>
          </iv-sidebar-group-content>
        </iv-sidebar-group>
      } @empty {
        <p class="text-muted-foreground px-3 py-2 text-[0.8125rem]">No page matches "{{ query() }}".</p>
      }
    </nav>
  `,
})
export class SiteNav {
  private readonly sidebar = inject(IvSidebarService, { optional: true });

  protected readonly query = signal('');
  protected readonly groups = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({ ...g, pages: g.pages.filter((p) => p.title.toLowerCase().includes(q)) })).filter(
      (g) => g.pages.length,
    );
  });

  protected closeOnMobile(): void {
    if (this.sidebar?.isMobile()) this.sidebar.openMobile.set(false);
  }
}

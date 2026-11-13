import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IvBadge } from '@inlaylab/ivorie/badge';
import {
  IvSidebarGroup, IvSidebarGroupContent, IvSidebarGroupLabel, IvSidebarMenu, IvSidebarMenuItem,
  IvSidebarService,
} from '@inlaylab/ivorie/sidebar';
import { PAGES } from '../../generated/pages';

/** Component groups, by what you build with them. A component missing here lands in "More". */
const KINDS: { label: string; slugs: string[] }[] = [
  {
    label: 'Forms and inputs',
    slugs: ['button', 'button-group', 'calendar', 'checkbox', 'combobox', 'field', 'input', 'input-otp', 'native-select', 'radio-group', 'select', 'select-picker', 'slider', 'switch', 'toggle', 'toggle-group'],
  },
  {
    label: 'Overlays and menus',
    slugs: ['alert-dialog', 'command', 'context-menu', 'dialog', 'drawer', 'dropdown-menu', 'hover-card', 'menubar', 'popover', 'sheet', 'toast', 'tooltip'],
  },
  {
    label: 'Layout and navigation',
    slugs: ['accordion', 'aspect-ratio', 'breadcrumb', 'card', 'carousel', 'collapsible', 'item', 'navigation-menu', 'pagination', 'resizable', 'scroll-area', 'separator', 'sidebar', 'tabs'],
  },
  { label: 'Data display', slugs: ['avatar', 'badge', 'chart', 'data-table', 'empty', 'icon', 'kbd', 'table'] },
  { label: 'Feedback', slugs: ['alert', 'progress', 'skeleton', 'spinner'] },
];
const components = PAGES.filter((p) => p.section === 'component');
const kinded = new Set(KINDS.flatMap((k) => k.slugs));

/** Icons for the top links only: 24px paths, stroked. */
const ICONS: Record<string, string> = {
  installation: 'M12 3v12m-5-5 5 5 5-5M5 21h14',
  theming: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.4-1-1.7-1-2.9 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8ZM7.5 11h.01M10.5 7h.01M15 7.5h.01',
  cli: 'm5 8 4 4-4 4m7 0h7M4 4h16v16H4z',
  mcp: 'M9 2v6m6-6v6M6 8h12v4a6 6 0 0 1-12 0V8Zm6 10v4',
  components: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
};

export const GROUPS: { label: string; pages: { slug: string; title: string; soon?: boolean }[] }[] = [
  {
    label: 'Getting started',
    pages: [...PAGES.filter((p) => p.section === 'guide'), { slug: 'components', title: 'All components', soon: false }],
  },
  ...KINDS.map((k) => ({ label: k.label, pages: components.filter((p) => k.slugs.includes(p.slug)) })),
  { label: 'More', pages: components.filter((p) => !kinded.has(p.slug)) },
  { label: 'Charts', pages: PAGES.filter((p) => p.section === 'charts') },
].filter((g) => g.pages.length);

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
          <iv-sidebar-group-label class="text-foreground/90 px-3 text-xs font-semibold">{{ group.label }}</iv-sidebar-group-label>
          <iv-sidebar-group-content>
            <ul ivSidebarMenu class="gap-px">
              @for (page of group.pages; track page.slug) {
                <li ivSidebarMenuItem>
                  <a
                    [routerLink]="['/docs', page.slug]"
                    routerLinkActive="docs-nav-active bg-foreground/[0.07] !text-foreground"
                    ariaCurrentWhenActive="page"
                    class="text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] focus-visible:ring-ring group flex h-8 items-center gap-2.5 rounded-lg px-3 text-[0.8125rem] font-medium transition-colors outline-none focus-visible:ring-2"
                    (click)="closeOnMobile()"
                  >
                    @if (icons[page.slug]; as d) {
                      <svg class="size-4 shrink-0 opacity-80 group-[.docs-nav-active]:text-(--brand) group-[.docs-nav-active]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="d" /></svg>
                    } @else {
                      <!-- The brand dot marks the open page. -->
                      <span class="docs-brand-gradient hidden size-1.5 shrink-0 rounded-full group-[.docs-nav-active]:block" aria-hidden="true"></span>
                    }
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

  protected readonly icons = ICONS;
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

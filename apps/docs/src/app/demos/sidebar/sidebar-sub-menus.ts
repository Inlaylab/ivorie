import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideLayoutDashboard, LucideInbox, LucideFolderKanban, LucideCalendar, LucideUsers, LucideChevronsUpDown, LucideSparkles } from '@lucide/angular';
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar';

// A nested list under a menu item, with the current page marked.
// cookieName="" so this demo never saves its state over the site's own sidebar.
@Component({
  selector: 'demo-sidebar-sub-menus',
  imports: [IV_SIDEBAR_IMPORTS, LucideLayoutDashboard, LucideInbox, LucideFolderKanban, LucideCalendar, LucideUsers, LucideChevronsUpDown, LucideSparkles],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-[560px] w-full transform-gpu overflow-hidden rounded-xl border">
      <iv-sidebar-provider cookieName="" class="h-full min-h-0">
        <iv-sidebar collapsible="offcanvas" class="h-full">
          <iv-sidebar-header>
            <ul ivSidebarMenu>
              <li ivSidebarMenuItem>
                <iv-sidebar-menu-button size="lg" tooltip="Acme Inc">
                  <span class="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg">
                    <svg lucideSparkles></svg>
                  </span>
                  <span class="grid flex-1 text-left leading-tight">
                    <span class="truncate font-medium">Acme Inc</span>
                    <span class="text-muted-foreground truncate text-xs">Pro plan</span>
                  </span>
                  <svg lucideChevronsUpDown class="text-muted-foreground ml-auto"></svg>
                </iv-sidebar-menu-button>
              </li>
            </ul>
          </iv-sidebar-header>
          <iv-sidebar-content>
            <iv-sidebar-group>
              <iv-sidebar-group-label>Workspace</iv-sidebar-group-label>
              <ul ivSidebarMenu>
                <li ivSidebarMenuItem>
                  <iv-sidebar-menu-button [isActive]="true" tooltip="Dashboard">
                    <svg lucideLayoutDashboard></svg><span>Dashboard</span>
                  </iv-sidebar-menu-button>
                </li>
                <li ivSidebarMenuItem>
                  <iv-sidebar-menu-button tooltip="Inbox">
                    <svg lucideInbox></svg><span>Inbox</span>
                  </iv-sidebar-menu-button>
                  <iv-sidebar-menu-badge>12</iv-sidebar-menu-badge>
                </li>
                <li ivSidebarMenuItem>
                  <iv-sidebar-menu-button tooltip="Projects">
                    <svg lucideFolderKanban></svg><span>Projects</span>
                  </iv-sidebar-menu-button>
                  <ul ivSidebarMenuSub>
                    @for (p of projects; track p) {
                      <li ivSidebarMenuSubItem>
                        <a ivSidebarMenuSubButton href="#" [isActive]="p === 'Website redesign'" (click)="$event.preventDefault()">
                          <span>{{ p }}</span>
                        </a>
                      </li>
                    }
                  </ul>
                </li>
                <li ivSidebarMenuItem>
                  <iv-sidebar-menu-button tooltip="Calendar">
                    <svg lucideCalendar></svg><span>Calendar</span>
                  </iv-sidebar-menu-button>
                </li>
                <li ivSidebarMenuItem>
                  <iv-sidebar-menu-button tooltip="Team">
                    <svg lucideUsers></svg><span>Team</span>
                  </iv-sidebar-menu-button>
                </li>
              </ul>
            </iv-sidebar-group>
          </iv-sidebar-content>
          <iv-sidebar-footer>
            <ul ivSidebarMenu>
              <li ivSidebarMenuItem>
                <iv-sidebar-menu-button size="lg" tooltip="Maya Ross">
                  <span class="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">MR</span>
                  <span class="grid flex-1 text-left leading-tight">
                    <span class="truncate font-medium">Maya Ross</span>
                    <span class="text-muted-foreground truncate text-xs">maya&#64;acme.dev</span>
                  </span>
                  <svg lucideChevronsUpDown class="text-muted-foreground ml-auto"></svg>
                </iv-sidebar-menu-button>
              </li>
            </ul>
          </iv-sidebar-footer>
          <iv-sidebar-rail />
        </iv-sidebar>
        <main ivSidebarInset class="min-w-0">
          <header class="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <iv-sidebar-trigger />
            <span class="bg-border h-4 w-px shrink-0"></span>
            <nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 text-sm">
              <span class="text-muted-foreground hidden sm:inline">Workspace</span>
              <span class="text-muted-foreground hidden sm:inline">/</span>
              <span class="truncate font-medium">Dashboard</span>
            </nav>
          </header>
          <div class="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div class="grid grid-cols-3 gap-3">
              @for (s of stats; track s.label) {
                <div class="bg-muted/50 rounded-xl p-3">
                  <div class="text-muted-foreground truncate text-xs">{{ s.label }}</div>
                  <div class="mt-1 text-lg font-semibold tabular-nums">{{ s.value }}</div>
                </div>
              }
            </div>
            <div class="bg-muted/50 flex-1 rounded-xl"></div>
          </div>
        </main>
      </iv-sidebar-provider>
    </div>
  `,
})
export default class SidebarSubMenusDemo {
  protected readonly projects = ['Website redesign', 'Mobile app', 'Brand refresh'];
  protected readonly stats = [
    { label: 'Open issues', value: '24' },
    { label: 'In review', value: '7' },
    { label: 'Shipped', value: '132' },
  ];
}

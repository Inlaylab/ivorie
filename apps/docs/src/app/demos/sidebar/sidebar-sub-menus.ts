import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHouse, LucideInbox, LucideSettings } from '@lucide/angular';
import { IV_SIDEBAR_IMPORTS } from '@ivorie/ui/sidebar';

@Component({
  selector: 'demo-sidebar-sub-menus',
  imports: [IV_SIDEBAR_IMPORTS, LucideHouse, LucideInbox, LucideSettings],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-[420px] w-full transform-gpu overflow-hidden rounded-xl border">
      <iv-sidebar-provider class="h-full min-h-0">
        <iv-sidebar collapsible="none" class="h-full">
          <iv-sidebar-header class="p-2 text-sm font-semibold">Acme</iv-sidebar-header>
          <iv-sidebar-content>
            <iv-sidebar-group>
              <iv-sidebar-group-label>Navigation</iv-sidebar-group-label>
              <iv-sidebar-group-content>
                <ul ivSidebarMenu>
                  <li ivSidebarMenuItem>
                    <iv-sidebar-menu-button [isActive]="true" tooltip="Home">
                      <svg lucideHouse></svg><span>Home</span>
                    </iv-sidebar-menu-button>
                  </li>
                  <li ivSidebarMenuItem>
                    <iv-sidebar-menu-button tooltip="Inbox">
                      <svg lucideInbox></svg><span>Inbox</span>
                    </iv-sidebar-menu-button>
                    <iv-sidebar-menu-badge>12</iv-sidebar-menu-badge>
                  </li>
                  <li ivSidebarMenuItem>
                    <iv-sidebar-menu-button>
                      <svg lucideInbox></svg><span>Projects</span>
                    </iv-sidebar-menu-button>
                    <ul ivSidebarMenuSub>
                      <li ivSidebarMenuSubItem>
                        <a ivSidebarMenuSubButton href="#" [isActive]="true" (click)="$event.preventDefault()">Alpha</a>
                      </li>
                      <li ivSidebarMenuSubItem>
                        <a ivSidebarMenuSubButton href="#" (click)="$event.preventDefault()">Beta</a>
                      </li>
                    </ul>
                  </li>
                  <li ivSidebarMenuItem>
                    <iv-sidebar-menu-button tooltip="Settings">
                      <svg lucideSettings></svg><span>Settings</span>
                    </iv-sidebar-menu-button>
                  </li>
                </ul>
              </iv-sidebar-group-content>
            </iv-sidebar-group>
          </iv-sidebar-content>
        </iv-sidebar>
        <main ivSidebarInset class="min-w-0">
          <header class="flex h-12 items-center gap-2 border-b px-3">
            <iv-sidebar-trigger />
            <span class="text-sm">Page title</span>
          </header>
          <div class="p-4 text-sm text-muted-foreground">Page content</div>
        </main>
      </iv-sidebar-provider>
    </div>
  `,
})
export default class SidebarSubMenusDemo {}

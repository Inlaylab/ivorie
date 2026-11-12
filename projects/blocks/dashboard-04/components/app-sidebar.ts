import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideZap } from '@ng-icons/lucide'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain, user } from '../data'
import { NavUser } from './nav-user'

/** The sidebar: the logo, each section with its links nested under it, and the user. Floats over the page. */
@Component({
  selector: 'app-dashboard-04-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, IV_SIDEBAR_IMPORTS, NavUser],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar variant="floating">
      <iv-sidebar-header>
        <ul ivSidebarMenu>
          <li ivSidebarMenuItem>
            <a ivSidebarMenuButton size="lg" routerLink=".">
              <span class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ng-icon [svg]="logo" size="16" />
              </span>
              <span class="flex flex-col gap-0.5 leading-none">
                <span class="font-medium">Relay</span>
                <span class="text-xs">Team plan</span>
              </span>
            </a>
          </li>
        </ul>
      </iv-sidebar-header>
      <iv-sidebar-content>
        <iv-sidebar-group>
          <ul ivSidebarMenu class="gap-2">
            @for (section of nav; track section.url) {
              <li ivSidebarMenuItem>
                <a ivSidebarMenuButton class="font-medium" [routerLink]="section.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">{{ section.title }}</a>
                <ul ivSidebarMenuSub class="ml-0 border-l-0 px-1.5">
                  @for (item of section.items; track item.url) {
                    <li ivSidebarMenuSubItem>
                      <a ivSidebarMenuSubButton [routerLink]="item.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">{{ item.title }}</a>
                    </li>
                  }
                </ul>
              </li>
            }
          </ul>
        </iv-sidebar-group>
      </iv-sidebar-content>
      <iv-sidebar-footer>
        <app-dashboard-04-nav-user [user]="user" />
      </iv-sidebar-footer>
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly logo = lucideZap
  protected readonly nav = navMain
  protected readonly user = user
}

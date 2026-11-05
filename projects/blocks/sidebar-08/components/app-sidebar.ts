import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideCommand } from '@ng-icons/lucide'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain, navSecondary, projects, user } from '../data'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

/** The sidebar, inset: logo, main nav, projects, help links and the user. */
@Component({
  selector: 'app-sidebar-08-sidebar',
  imports: [RouterLink, NgIcon, IV_SIDEBAR_IMPORTS, NavMain, NavProjects, NavSecondary, NavUser],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar variant="inset">
      <iv-sidebar-header>
        <ul ivSidebarMenu>
          <li ivSidebarMenuItem>
            <a ivSidebarMenuButton size="lg" routerLink=".">
              <span class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ng-icon [svg]="logo" size="16" />
              </span>
              <span class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Acme Inc</span>
                <span class="truncate text-xs">Enterprise</span>
              </span>
            </a>
          </li>
        </ul>
      </iv-sidebar-header>
      <iv-sidebar-content>
        <app-sidebar-08-nav-main [items]="nav" />
        <app-sidebar-08-nav-projects [projects]="projects" />
        <app-sidebar-08-nav-secondary class="mt-auto" [items]="secondary" />
      </iv-sidebar-content>
      <iv-sidebar-footer>
        <app-sidebar-08-nav-user [user]="user" />
      </iv-sidebar-footer>
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly logo = lucideCommand
  protected readonly nav = navMain
  protected readonly projects = projects
  protected readonly secondary = navSecondary
  protected readonly user = user
}

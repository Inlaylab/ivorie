import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain, projects, teams, user } from '../data'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

/** The sidebar: team switcher, main nav, projects and the user. It collapses to icons. */
@Component({
  selector: 'app-sidebar-07-sidebar',
  imports: [IV_SIDEBAR_IMPORTS, NavMain, NavProjects, NavUser, TeamSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar collapsible="icon">
      <iv-sidebar-header>
        <app-sidebar-07-team-switcher [teams]="teams" />
      </iv-sidebar-header>
      <iv-sidebar-content>
        <app-sidebar-07-nav-main [items]="nav" />
        <app-sidebar-07-nav-projects [projects]="projects" />
      </iv-sidebar-content>
      <iv-sidebar-footer>
        <app-sidebar-07-nav-user [user]="user" />
      </iv-sidebar-footer>
      <iv-sidebar-rail />
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly teams = teams
  protected readonly nav = navMain
  protected readonly projects = projects
  protected readonly user = user
}

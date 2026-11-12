import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { channels, navMain, teams, user } from '../data'
import { NavMain } from './nav-main'
import { NavChannels } from './nav-channels'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

/** The sidebar: team switcher, main nav, sales channels and the user. It collapses to icons. */
@Component({
  selector: 'app-dashboard-03-sidebar',
  imports: [IV_SIDEBAR_IMPORTS, NavMain, NavChannels, NavUser, TeamSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar collapsible="icon">
      <iv-sidebar-header>
        <app-dashboard-03-team-switcher [teams]="teams" />
      </iv-sidebar-header>
      <iv-sidebar-content>
        <app-dashboard-03-nav-main [items]="nav" />
        <app-dashboard-03-nav-channels [channels]="channels" />
      </iv-sidebar-content>
      <iv-sidebar-footer>
        <app-dashboard-03-nav-user [user]="user" />
      </iv-sidebar-footer>
      <iv-sidebar-rail />
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly teams = teams
  protected readonly nav = navMain
  protected readonly channels = channels
  protected readonly user = user
}

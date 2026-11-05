import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain, versions } from '../data'
import { SearchForm } from './search-form'
import { VersionSwitcher } from './version-switcher'

/** The sidebar: version switcher, search, then one group per section. */
@Component({
  selector: 'app-sidebar-01-sidebar',
  imports: [RouterLink, RouterLinkActive, IV_SIDEBAR_IMPORTS, SearchForm, VersionSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar>
      <iv-sidebar-header>
        <app-sidebar-01-version-switcher [versions]="versions" />
        <app-sidebar-01-search-form />
      </iv-sidebar-header>
      <iv-sidebar-content>
        @for (section of nav; track section.url) {
          <iv-sidebar-group>
            <iv-sidebar-group-label>{{ section.title }}</iv-sidebar-group-label>
            <iv-sidebar-group-content>
              <ul ivSidebarMenu>
                @for (item of section.items; track item.url) {
                  <li ivSidebarMenuItem>
                    <a ivSidebarMenuButton [routerLink]="item.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">{{ item.title }}</a>
                  </li>
                }
              </ul>
            </iv-sidebar-group-content>
          </iv-sidebar-group>
        }
      </iv-sidebar-content>
      <iv-sidebar-rail />
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly nav = navMain
  protected readonly versions = versions
}

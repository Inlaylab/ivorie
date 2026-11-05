import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideChevronRight } from '@ng-icons/lucide'
import { IV_COLLAPSIBLE_IMPORTS } from '@inlaylab/ivorie/collapsible'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain, versions } from '../data'
import { SearchForm } from './search-form'
import { VersionSwitcher } from './version-switcher'

/** The sidebar: version switcher, search, then one group per section. */
@Component({
  selector: 'app-sidebar-02-sidebar',
  imports: [NgIcon, IV_COLLAPSIBLE_IMPORTS, RouterLink, RouterLinkActive, IV_SIDEBAR_IMPORTS, SearchForm, VersionSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar>
      <iv-sidebar-header>
        <app-sidebar-02-version-switcher [versions]="versions" />
        <app-sidebar-02-search-form />
      </iv-sidebar-header>
      <iv-sidebar-content class="gap-0">
        @for (section of nav; track section.url) {
          <iv-collapsible [open]="true" #c>
            <iv-sidebar-group>
              <iv-sidebar-group-label class="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-0 text-sm">
                <button ivCollapsibleTrigger type="button" class="flex size-full items-center px-2">
                  {{ section.title }}
                  <ng-icon [svg]="chevron" size="16" class="ml-auto transition-transform" [class.rotate-90]="c.open()" />
                </button>
              </iv-sidebar-group-label>
              <iv-collapsible-content>
                <iv-sidebar-group-content>
                  <ul ivSidebarMenu>
                    @for (item of section.items; track item.url) {
                      <li ivSidebarMenuItem>
                        <a ivSidebarMenuButton [routerLink]="item.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">{{ item.title }}</a>
                      </li>
                    }
                  </ul>
                </iv-sidebar-group-content>
              </iv-collapsible-content>
            </iv-sidebar-group>
          </iv-collapsible>
        }
      </iv-sidebar-content>
      <iv-sidebar-rail />
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly nav = navMain
  protected readonly versions = versions
  protected readonly chevron = lucideChevronRight
}

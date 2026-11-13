import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'

/** Small links at the bottom of the content: support, feedback. */
@Component({
  selector: 'app-dashboard-02-nav-secondary',
  imports: [RouterLink, RouterLinkActive, NgIcon, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-group>
      <iv-sidebar-group-content>
        <ul ivSidebarMenu>
          @for (item of items(); track item.url) {
            <li ivSidebarMenuItem>
              <a ivSidebarMenuButton size="sm" [routerLink]="item.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive"><ng-icon [svg]="item.icon" size="16" /><span>{{ item.title }}</span></a>
            </li>
          }
        </ul>
      </iv-sidebar-group-content>
    </iv-sidebar-group>
  `,
})
export class NavSecondary {
  readonly items = input.required<{ title: string; url: string; icon: string }[]>()
}

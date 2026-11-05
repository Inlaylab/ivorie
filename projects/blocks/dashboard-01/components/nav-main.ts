import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideChevronRight } from '@ng-icons/lucide'
import { IV_COLLAPSIBLE_IMPORTS } from '@inlaylab/ivorie/collapsible'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { NavItem } from '../data'

/** The main nav: each item opens to its sub links. The first item starts open. */
@Component({
  selector: 'app-dashboard-01-nav-main',
  imports: [RouterLink, RouterLinkActive, NgIcon, IV_COLLAPSIBLE_IMPORTS, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-group>
      <iv-sidebar-group-label>Platform</iv-sidebar-group-label>
      <ul ivSidebarMenu>
        @for (item of items(); track item.url; let first = $first) {
          <li ivSidebarMenuItem>
            <iv-collapsible [open]="first" #c>
              <button ivSidebarMenuButton ivCollapsibleTrigger type="button" [attr.aria-label]="item.title">
                <ng-icon [svg]="item.icon" size="16" />
                <span>{{ item.title }}</span>
                <ng-icon [svg]="chevron" size="16" class="ml-auto transition-transform duration-200" [class.rotate-90]="c.open()" />
              </button>
              <iv-collapsible-content>
                <ul ivSidebarMenuSub>
                  @for (sub of item.items ?? []; track sub.url) {
                    <li ivSidebarMenuSubItem>
                      <a ivSidebarMenuSubButton [routerLink]="sub.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">{{ sub.title }}</a>
                    </li>
                  }
                </ul>
              </iv-collapsible-content>
            </iv-collapsible>
          </li>
        }
      </ul>
    </iv-sidebar-group>
  `,
})
export class NavMain {
  readonly items = input.required<NavItem[]>()
  protected readonly chevron = lucideChevronRight
}

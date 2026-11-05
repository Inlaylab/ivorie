import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideEllipsis } from '@ng-icons/lucide'
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { NavSection } from '../data'

/** The main nav: each section opens a menu of its links. */
@Component({
  selector: 'app-sidebar-06-nav-main',
  imports: [RouterLink, NgIcon, IV_DROPDOWN_MENU_IMPORTS, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-group>
      <ul ivSidebarMenu>
        @for (section of items(); track section.url) {
          <li ivSidebarMenuItem>
            <iv-dropdown-menu>
              <button ivSidebarMenuButton ivDropdownMenuTrigger type="button" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                {{ section.title }}
                <ng-icon [svg]="more" size="16" class="ml-auto" />
              </button>
              <iv-dropdown-menu-content side="right" align="start" class="min-w-56 rounded-lg">
                @for (item of section.items; track item.url) {
                  <iv-dropdown-menu-item [routerLink]="item.url">{{ item.title }}</iv-dropdown-menu-item>
                }
              </iv-dropdown-menu-content>
            </iv-dropdown-menu>
          </li>
        }
      </ul>
    </iv-sidebar-group>
  `,
})
export class NavMain {
  readonly items = input.required<NavSection[]>()
  protected readonly more = lucideEllipsis
}

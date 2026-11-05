import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideEllipsis, lucideFolder, lucideShare, lucideTrash } from '@ng-icons/lucide'
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu'
import { IV_SIDEBAR_IMPORTS, IvSidebarService } from '@inlaylab/ivorie/sidebar'

/** The projects list, each with an actions menu. */
@Component({
  selector: 'app-sidebar-07-nav-projects',
  imports: [RouterLink, RouterLinkActive, NgIcon, IV_DROPDOWN_MENU_IMPORTS, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-group class="group-data-[collapsible=icon]:hidden">
      <iv-sidebar-group-label>Projects</iv-sidebar-group-label>
      <ul ivSidebarMenu>
        @for (p of projects(); track p.url) {
          <li ivSidebarMenuItem>
            <a ivSidebarMenuButton [routerLink]="p.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">
              <ng-icon [svg]="p.icon" size="16" />
              <span>{{ p.name }}</span>
            </a>
            <iv-dropdown-menu>
              <iv-sidebar-menu-action ivDropdownMenuTrigger [showOnHover]="true">
                <ng-icon [svg]="icons.more" size="16" />
                <span class="sr-only">More for {{ p.name }}</span>
              </iv-sidebar-menu-action>
              <iv-dropdown-menu-content class="w-48 rounded-lg" [side]="sidebar.isMobile() ? 'bottom' : 'right'" [align]="sidebar.isMobile() ? 'end' : 'start'">
                <iv-dropdown-menu-item><ng-icon [svg]="icons.folder" size="16" class="text-muted-foreground" />View Project</iv-dropdown-menu-item>
                <iv-dropdown-menu-item><ng-icon [svg]="icons.share" size="16" class="text-muted-foreground" />Share Project</iv-dropdown-menu-item>
                <iv-dropdown-menu-separator />
                <iv-dropdown-menu-item variant="destructive"><ng-icon [svg]="icons.trash" size="16" />Delete Project</iv-dropdown-menu-item>
              </iv-dropdown-menu-content>
            </iv-dropdown-menu>
          </li>
        }
        <li ivSidebarMenuItem>
          <button ivSidebarMenuButton type="button" class="text-sidebar-foreground/70">
            <ng-icon [svg]="icons.more" size="16" class="text-sidebar-foreground/70" />
            <span>More</span>
          </button>
        </li>
      </ul>
    </iv-sidebar-group>
  `,
})
export class NavProjects {
  readonly projects = input.required<{ name: string; url: string; icon: string }[]>()
  protected readonly sidebar = inject(IvSidebarService)
  protected readonly icons = { more: lucideEllipsis, folder: lucideFolder, share: lucideShare, trash: lucideTrash }
}

import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain } from '../data'

/** The sidebar: the logo, then each section with its links nested under it. */
@Component({
  selector: 'app-sidebar-03-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar>
      <iv-sidebar-header>
        <ul ivSidebarMenu>
          <li ivSidebarMenuItem>
            <a ivSidebarMenuButton size="lg" routerLink=".">
              <span class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ng-icon [svg]="logo" size="16" />
              </span>
              <span class="flex flex-col gap-0.5 leading-none">
                <span class="font-medium">Documentation</span>
                <span>v1.0.0</span>
              </span>
            </a>
          </li>
        </ul>
      </iv-sidebar-header>
      <iv-sidebar-content>
        <iv-sidebar-group>
          <ul ivSidebarMenu>
            @for (section of nav; track section.url) {
              <li ivSidebarMenuItem>
                <a ivSidebarMenuButton class="font-medium" [routerLink]="section.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">{{ section.title }}</a>
                <ul ivSidebarMenuSub>
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
      <iv-sidebar-rail />
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly nav = navMain
  protected readonly logo = lucideGalleryVerticalEnd
}

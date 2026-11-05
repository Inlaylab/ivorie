import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain } from '../data'
import { NavMain } from './nav-main'
import { OptInForm } from './opt-in-form'

/** The sidebar: logo, sections that open as menus, and a newsletter card in the footer. */
@Component({
  selector: 'app-sidebar-06-sidebar',
  imports: [RouterLink, NgIcon, IV_SIDEBAR_IMPORTS, NavMain, OptInForm],
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
        <app-sidebar-06-nav-main [items]="nav" />
      </iv-sidebar-content>
      <iv-sidebar-footer>
        <div class="p-1"><app-sidebar-06-opt-in-form /></div>
      </iv-sidebar-footer>
      <iv-sidebar-rail />
    </iv-sidebar>
  `,
})
export class AppSidebar {
  protected readonly nav = navMain
  protected readonly logo = lucideGalleryVerticalEnd
}

import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
import { lucideGalleryVerticalEnd, lucideMinus, lucidePlus } from '@ng-icons/lucide'
import { IV_COLLAPSIBLE_IMPORTS } from '@inlaylab/ivorie/collapsible'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { navMain } from '../data'
import { SearchForm } from './search-form'

/** The sidebar: logo and search, then sections that open and close. The second starts open. */
@Component({
  selector: 'app-sidebar-05-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, IV_COLLAPSIBLE_IMPORTS, IV_SIDEBAR_IMPORTS, SearchForm],
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
        <app-sidebar-05-search-form />
      </iv-sidebar-header>
      <iv-sidebar-content>
        <iv-sidebar-group>
          <ul ivSidebarMenu>
            @for (section of nav; track section.url; let i = $index) {
              <li ivSidebarMenuItem>
                <iv-collapsible [open]="i === 1" #c>
                  <button ivSidebarMenuButton ivCollapsibleTrigger type="button">
                    {{ section.title }}
                    <ng-icon [svg]="c.open() ? icons.minus : icons.plus" size="16" class="ml-auto" />
                  </button>
                  <iv-collapsible-content>
                    <ul ivSidebarMenuSub>
                      @for (item of section.items; track item.url) {
                        <li ivSidebarMenuSubItem>
                          <a ivSidebarMenuSubButton [routerLink]="item.url" routerLinkActive #rla="routerLinkActive" [isActive]="rla.isActive">{{ item.title }}</a>
                        </li>
                      }
                    </ul>
                  </iv-collapsible-content>
                </iv-collapsible>
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
  protected readonly icons = { plus: lucidePlus, minus: lucideMinus }
}

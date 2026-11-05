import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideCheck, lucideChevronsUpDown, lucideGalleryVerticalEnd } from '@ng-icons/lucide'
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'

/** Picks the docs version. Your app reads `selected`. */
@Component({
  selector: 'app-sidebar-01-version-switcher',
  imports: [NgIcon, IV_DROPDOWN_MENU_IMPORTS, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul ivSidebarMenu>
      <li ivSidebarMenuItem>
        <iv-dropdown-menu>
          <button ivSidebarMenuButton ivDropdownMenuTrigger type="button" size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <span class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <ng-icon [svg]="icons.logo" size="16" />
            </span>
            <span class="flex flex-col gap-0.5 leading-none">
              <span class="font-medium">Documentation</span>
              <span>v{{ selected() }}</span>
            </span>
            <ng-icon [svg]="icons.chevrons" size="16" class="ml-auto" />
          </button>
          <iv-dropdown-menu-content align="start" class="w-(--cdk-overlay-trigger-width,14rem)">
            @for (v of versions(); track v) {
              <iv-dropdown-menu-item (select)="selected.set(v)">
                v{{ v }}
                @if (v === selected()) {
                  <ng-icon [svg]="icons.check" size="16" class="ml-auto" />
                }
              </iv-dropdown-menu-item>
            }
          </iv-dropdown-menu-content>
        </iv-dropdown-menu>
      </li>
    </ul>
  `,
})
export class VersionSwitcher {
  readonly versions = input.required<string[]>()
  readonly selected = linkedSignal(() => this.versions()[0])
  protected readonly icons = { logo: lucideGalleryVerticalEnd, chevrons: lucideChevronsUpDown, check: lucideCheck }
}

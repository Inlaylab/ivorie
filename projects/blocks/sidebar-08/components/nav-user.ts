import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideBadgeCheck, lucideBell, lucideChevronsUpDown, lucideCreditCard, lucideLogOut, lucideSparkles } from '@ng-icons/lucide'
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar'
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu'
import { IV_SIDEBAR_IMPORTS, IvSidebarService } from '@inlaylab/ivorie/sidebar'

/** The signed-in user, with an account menu. Wire the items to your routes. */
@Component({
  selector: 'app-sidebar-08-nav-user',
  imports: [NgIcon, IV_AVATAR_IMPORTS, IV_DROPDOWN_MENU_IMPORTS, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul ivSidebarMenu>
      <li ivSidebarMenuItem>
        <iv-dropdown-menu>
          <button ivSidebarMenuButton ivDropdownMenuTrigger type="button" size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <iv-avatar class="size-8 rounded-lg"><iv-avatar-fallback class="rounded-lg">{{ user().initials }}</iv-avatar-fallback></iv-avatar>
            <span class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ user().name }}</span>
              <span class="truncate text-xs">{{ user().email }}</span>
            </span>
            <ng-icon [svg]="icons.chevrons" size="16" class="ml-auto" />
          </button>
          <iv-dropdown-menu-content [side]="sidebar.isMobile() ? 'bottom' : 'right'" align="end" class="min-w-56 rounded-lg">
            <iv-dropdown-menu-label class="p-0 font-normal">
              <span class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <iv-avatar class="size-8 rounded-lg"><iv-avatar-fallback class="rounded-lg">{{ user().initials }}</iv-avatar-fallback></iv-avatar>
                <span class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{{ user().name }}</span>
                  <span class="truncate text-xs">{{ user().email }}</span>
                </span>
              </span>
            </iv-dropdown-menu-label>
            <iv-dropdown-menu-separator />
            <iv-dropdown-menu-item><ng-icon [svg]="icons.sparkles" size="16" />Upgrade to Pro</iv-dropdown-menu-item>
            <iv-dropdown-menu-separator />
            <iv-dropdown-menu-item><ng-icon [svg]="icons.badge" size="16" />Account</iv-dropdown-menu-item>
            <iv-dropdown-menu-item><ng-icon [svg]="icons.card" size="16" />Billing</iv-dropdown-menu-item>
            <iv-dropdown-menu-item><ng-icon [svg]="icons.bell" size="16" />Notifications</iv-dropdown-menu-item>
            <iv-dropdown-menu-separator />
            <iv-dropdown-menu-item><ng-icon [svg]="icons.logOut" size="16" />Log out</iv-dropdown-menu-item>
          </iv-dropdown-menu-content>
        </iv-dropdown-menu>
      </li>
    </ul>
  `,
})
export class NavUser {
  readonly user = input.required<{ name: string; email: string; initials: string }>()
  protected readonly sidebar = inject(IvSidebarService)
  protected readonly icons = {
    chevrons: lucideChevronsUpDown,
    sparkles: lucideSparkles,
    badge: lucideBadgeCheck,
    card: lucideCreditCard,
    bell: lucideBell,
    logOut: lucideLogOut,
  }
}

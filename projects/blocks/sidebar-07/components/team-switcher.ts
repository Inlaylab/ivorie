import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideChevronsUpDown, lucidePlus } from '@ng-icons/lucide'
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu'
import { IV_SIDEBAR_IMPORTS, IvSidebarService } from '@inlaylab/ivorie/sidebar'

export interface Team {
  name: string
  /** An svg string from @ng-icons. */
  logo: string
  plan: string
}

/** Switches the active team. Your app reads `active`. */
@Component({
  selector: 'app-sidebar-07-team-switcher',
  imports: [NgIcon, IV_DROPDOWN_MENU_IMPORTS, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul ivSidebarMenu>
      <li ivSidebarMenuItem>
        <iv-dropdown-menu>
          <button ivSidebarMenuButton ivDropdownMenuTrigger type="button" size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <span class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <ng-icon [svg]="active().logo" size="16" />
            </span>
            <span class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ active().name }}</span>
              <span class="truncate text-xs">{{ active().plan }}</span>
            </span>
            <ng-icon [svg]="icons.chevrons" size="16" class="ml-auto" />
          </button>
          <iv-dropdown-menu-content [side]="sidebar.isMobile() ? 'bottom' : 'right'" align="start" class="min-w-56 rounded-lg">
            <iv-dropdown-menu-label class="text-muted-foreground text-xs">Teams</iv-dropdown-menu-label>
            @for (team of teams(); track team.name; let i = $index) {
              <iv-dropdown-menu-item class="gap-2 p-2" (select)="active.set(team)">
                <span class="flex size-6 items-center justify-center rounded-md border"><ng-icon [svg]="team.logo" size="14" /></span>
                {{ team.name }}
                <iv-dropdown-menu-shortcut>⌘{{ i + 1 }}</iv-dropdown-menu-shortcut>
              </iv-dropdown-menu-item>
            }
            <iv-dropdown-menu-separator />
            <iv-dropdown-menu-item class="gap-2 p-2">
              <span class="flex size-6 items-center justify-center rounded-md border bg-transparent"><ng-icon [svg]="icons.plus" size="16" /></span>
              <span class="text-muted-foreground font-medium">Add team</span>
            </iv-dropdown-menu-item>
          </iv-dropdown-menu-content>
        </iv-dropdown-menu>
      </li>
    </ul>
  `,
})
export class TeamSwitcher {
  readonly teams = input.required<Team[]>()
  readonly active = linkedSignal(() => this.teams()[0])
  protected readonly sidebar = inject(IvSidebarService)
  protected readonly icons = { chevrons: lucideChevronsUpDown, plus: lucidePlus }
}

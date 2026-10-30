import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IV_DROPDOWN_MENU_IMPORTS } from '@ivorie/ui/dropdown-menu';

@Component({
  selector: 'demo-dropdown-menu',
  imports: [IV_DROPDOWN_MENU_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dropdown-menu>
      <button ivButton ivDropdownMenuTrigger variant="outline" size="sm">Open</button>
      <iv-dropdown-menu-content>
        <iv-dropdown-menu-item>Profile</iv-dropdown-menu-item>
        <iv-dropdown-menu-item>Billing</iv-dropdown-menu-item>
        <iv-dropdown-menu-item>Team</iv-dropdown-menu-item>
        <iv-dropdown-menu-item>Subscription</iv-dropdown-menu-item>
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
export default class DropdownMenuDemo {}

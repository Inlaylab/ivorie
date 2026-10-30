import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';

@Component({
  selector: 'demo-dropdown-menu-submenu',
  imports: [IV_DROPDOWN_MENU_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dropdown-menu>
      <button ivButton ivDropdownMenuTrigger variant="outline" size="sm">Actions</button>
      <iv-dropdown-menu-content>
        <iv-dropdown-menu-item>New file</iv-dropdown-menu-item>
        <iv-dropdown-menu-item>New window</iv-dropdown-menu-item>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-sub>
          <iv-dropdown-menu-sub-trigger>Invite users</iv-dropdown-menu-sub-trigger>
          <iv-dropdown-menu-sub-content>
            <iv-dropdown-menu-item>Email</iv-dropdown-menu-item>
            <iv-dropdown-menu-item>Message</iv-dropdown-menu-item>
          </iv-dropdown-menu-sub-content>
        </iv-dropdown-menu-sub>
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
export default class DropdownMenuSubmenuDemo {}

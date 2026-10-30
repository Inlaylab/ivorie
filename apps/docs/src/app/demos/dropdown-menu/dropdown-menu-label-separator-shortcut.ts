import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';

@Component({
  selector: 'demo-dropdown-menu-label-separator-shortcut',
  imports: [IV_DROPDOWN_MENU_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dropdown-menu>
      <button ivButton ivDropdownMenuTrigger variant="outline" size="sm">My account</button>
      <iv-dropdown-menu-content>
        <iv-dropdown-menu-label>My account</iv-dropdown-menu-label>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-group>
          <iv-dropdown-menu-item>
            Profile
            <iv-dropdown-menu-shortcut>⇧⌘P</iv-dropdown-menu-shortcut>
          </iv-dropdown-menu-item>
          <iv-dropdown-menu-item>
            Settings
            <iv-dropdown-menu-shortcut>⌘,</iv-dropdown-menu-shortcut>
          </iv-dropdown-menu-item>
        </iv-dropdown-menu-group>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-item variant="destructive">
          Log out
          <iv-dropdown-menu-shortcut>⇧⌘Q</iv-dropdown-menu-shortcut>
        </iv-dropdown-menu-item>
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
export default class DropdownMenuLabelSeparatorShortcutDemo {}

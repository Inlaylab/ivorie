import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';

@Component({
  selector: 'demo-dropdown-menu-checkbox-items',
  imports: [IV_DROPDOWN_MENU_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dropdown-menu>
      <button ivButton ivDropdownMenuTrigger variant="outline" size="sm">View</button>
      <iv-dropdown-menu-content>
        <iv-dropdown-menu-label>Appearance</iv-dropdown-menu-label>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-checkbox-item [(checked)]="showStatusBar">Status bar</iv-dropdown-menu-checkbox-item>
        <iv-dropdown-menu-checkbox-item [(checked)]="showPanel">Panel</iv-dropdown-menu-checkbox-item>
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
export default class DropdownMenuCheckboxItemsDemo {
  protected readonly showStatusBar = signal(true);
  protected readonly showPanel = signal(false);
}

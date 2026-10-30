import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';

@Component({
  selector: 'demo-dropdown-menu-radio-group',
  imports: [IV_DROPDOWN_MENU_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dropdown-menu>
      <button ivButton ivDropdownMenuTrigger variant="outline" size="sm">Position: {{ position() }}</button>
      <iv-dropdown-menu-content>
        <iv-dropdown-menu-label>Panel position</iv-dropdown-menu-label>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-radio-group [value]="position()" (valueChange)="position.set($event)">
          <iv-dropdown-menu-radio-item value="top">Top</iv-dropdown-menu-radio-item>
          <iv-dropdown-menu-radio-item value="bottom">Bottom</iv-dropdown-menu-radio-item>
          <iv-dropdown-menu-radio-item value="right">Right</iv-dropdown-menu-radio-item>
        </iv-dropdown-menu-radio-group>
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
export default class DropdownMenuRadioGroupDemo {
  protected readonly position = signal('bottom');
}

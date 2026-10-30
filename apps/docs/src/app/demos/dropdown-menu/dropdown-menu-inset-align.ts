import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideEllipsis } from '@lucide/angular';
import { IvButton } from '@ivorie/ui/button';
import { IV_DROPDOWN_MENU_IMPORTS } from '@ivorie/ui/dropdown-menu';

@Component({
  selector: 'demo-dropdown-menu-inset-align',
  imports: [IV_DROPDOWN_MENU_IMPORTS, IvButton, LucideEllipsis],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dropdown-menu>
      <button ivButton ivDropdownMenuTrigger variant="outline" size="icon-sm" aria-label="More">
        <svg lucideEllipsis></svg>
      </button>
      <iv-dropdown-menu-content align="end">
        <iv-dropdown-menu-label [inset]="true">Account</iv-dropdown-menu-label>
        <iv-dropdown-menu-item [inset]="true">Overview</iv-dropdown-menu-item>
        <iv-dropdown-menu-item [inset]="true">Members</iv-dropdown-menu-item>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-item [inset]="true" variant="destructive">Delete workspace</iv-dropdown-menu-item>
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
export default class DropdownMenuInsetAlignDemo {}

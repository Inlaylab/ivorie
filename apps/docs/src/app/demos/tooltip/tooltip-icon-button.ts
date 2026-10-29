import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideSettings } from '@lucide/angular';
import { IvButton } from '@ivorie/ui/button';
import { IV_TOOLTIP_IMPORTS } from '@ivorie/ui/tooltip';

@Component({
  selector: 'demo-tooltip-icon-button',
  imports: [IV_TOOLTIP_IMPORTS, IvButton, LucideSettings],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tooltip>
      <button ivButton ivTooltipTrigger variant="ghost" size="icon" aria-label="Settings">
        <svg lucideSettings></svg>
      </button>
      <iv-tooltip-content>Settings</iv-tooltip-content>
    </iv-tooltip>
  `,
})
export default class TooltipIconButtonDemo {}

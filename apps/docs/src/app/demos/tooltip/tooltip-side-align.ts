import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IV_TOOLTIP_IMPORTS } from '@ivorie/ui/tooltip';

@Component({
  selector: 'demo-tooltip-side-align',
  imports: [IV_TOOLTIP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-2">
      <iv-tooltip>
        <button ivButton ivTooltipTrigger variant="outline">Top</button>
        <iv-tooltip-content side="top">Above</iv-tooltip-content>
      </iv-tooltip>
      <iv-tooltip>
        <button ivButton ivTooltipTrigger variant="outline">Right</button>
        <iv-tooltip-content side="right" align="start">To the right</iv-tooltip-content>
      </iv-tooltip>
      <iv-tooltip>
        <button ivButton ivTooltipTrigger variant="outline">Bottom</button>
        <iv-tooltip-content side="bottom" align="end">Below</iv-tooltip-content>
      </iv-tooltip>
    </div>
  `,
})
export default class TooltipSideAlignDemo {}

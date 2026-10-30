import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IV_TOOLTIP_IMPORTS } from '@ivorie/ui/tooltip';

@Component({
  selector: 'demo-tooltip',
  imports: [IV_TOOLTIP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tooltip>
      <button ivButton ivTooltipTrigger variant="outline">Hover me</button>
      <iv-tooltip-content>Add to library</iv-tooltip-content>
    </iv-tooltip>
  `,
})
export default class TooltipDemo {}

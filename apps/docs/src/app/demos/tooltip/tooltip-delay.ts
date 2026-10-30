import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_TOOLTIP_IMPORTS } from '@inlaylab/ivorie/tooltip';

@Component({
  selector: 'demo-tooltip-delay',
  imports: [IV_TOOLTIP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tooltip [delayDuration]="500">
      <button ivButton ivTooltipTrigger variant="outline">Slow tooltip</button>
      <iv-tooltip-content>Shows after 500ms</iv-tooltip-content>
    </iv-tooltip>
  `,
})
export default class TooltipDelayDemo {}

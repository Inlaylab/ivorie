import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_TOOLTIP_IMPORTS } from '@inlaylab/ivorie/tooltip';

@Component({
  selector: 'demo-tooltip-provider',
  imports: [IV_TOOLTIP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tooltip-provider [delayDuration]="0">
      <div class="flex gap-2">
        <iv-tooltip>
          <button ivButton ivTooltipTrigger variant="outline">Save</button>
          <iv-tooltip-content>Save document</iv-tooltip-content>
        </iv-tooltip>
        <iv-tooltip>
          <button ivButton ivTooltipTrigger variant="outline">Share</button>
          <iv-tooltip-content>Share link</iv-tooltip-content>
        </iv-tooltip>
      </div>
    </iv-tooltip-provider>
  `,
})
export default class TooltipProviderDemo {}

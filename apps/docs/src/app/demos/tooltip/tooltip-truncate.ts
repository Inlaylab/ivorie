import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvTruncateTooltip } from '@ivorie/ui/tooltip';

@Component({
  selector: 'demo-tooltip-truncate',
  imports: [IvTruncateTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="w-40 truncate rounded-md border px-3 py-2 text-sm" [ivTruncateTooltip]="name">
      {{ name }}
    </p>
  `,
})
export default class TooltipTruncateDemo {
  protected readonly name = 'quarterly-financial-report-final-v2.pdf';
}

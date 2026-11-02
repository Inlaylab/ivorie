import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_POPOVER_IMPORTS } from '@inlaylab/ivorie/popover';

@Component({
  selector: 'demo-popover-align',
  imports: [IV_POPOVER_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap justify-center gap-3">
      @for (a of aligns; track a) {
        <iv-popover>
          <button ivButton ivPopoverTrigger variant="outline" size="sm">{{ a }}</button>
          <iv-popover-content [align]="a" class="w-40">
            <iv-popover-title>Aligned {{ a }}</iv-popover-title>
          </iv-popover-content>
        </iv-popover>
      }
    </div>
  `,
})
export default class PopoverAlignDemo {
  protected readonly aligns = ['start', 'center', 'end'] as const;
}

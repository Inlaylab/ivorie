import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_POPOVER_IMPORTS } from '@inlaylab/ivorie/popover';

@Component({
  selector: 'demo-popover',
  imports: [IV_POPOVER_IMPORTS, IV_INPUT_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-popover>
      <button ivButton ivPopoverTrigger variant="outline">Open popover</button>
      <iv-popover-content class="w-80">
        <iv-popover-header>
          <iv-popover-title>Dimensions</iv-popover-title>
          <iv-popover-description>Set the dimensions for the layer.</iv-popover-description>
        </iv-popover-header>
        <div class="grid grid-cols-3 items-center gap-3">
          <label ivLabel for="pop-width">Width</label>
          <input ivInput id="pop-width" value="100%" class="col-span-2 h-8" />
          <label ivLabel for="pop-height">Height</label>
          <input ivInput id="pop-height" value="25px" class="col-span-2 h-8" />
        </div>
      </iv-popover-content>
    </iv-popover>
  `,
})
export default class PopoverDemo {}

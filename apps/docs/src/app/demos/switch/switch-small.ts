import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-small',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 text-sm">
      <label class="flex cursor-pointer items-center gap-3">
        <iv-switch size="sm" [checked]="true" />
        Small
      </label>
      <label class="flex cursor-pointer items-center gap-3">
        <iv-switch />
        Default
      </label>
    </div>
  `,
})
export default class SwitchSmallDemo {}

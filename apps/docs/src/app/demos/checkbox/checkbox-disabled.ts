import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';

@Component({
  selector: 'demo-checkbox-disabled',
  imports: [IvCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3 text-sm">
      <label class="flex items-center gap-2">
        <iv-checkbox [disabled]="true" />
        Unchecked
      </label>
      <label class="flex items-center gap-2">
        <iv-checkbox [checked]="true" [disabled]="true" />
        Checked
      </label>
    </div>
  `,
})
export default class CheckboxDisabledDemo {}

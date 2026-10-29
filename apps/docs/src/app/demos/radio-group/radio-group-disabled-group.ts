import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_RADIO_GROUP_IMPORTS } from '@ivorie/ui/radio-group';

@Component({
  selector: 'demo-radio-group-disabled-group',
  imports: [IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-radio-group value="pro" [disabled]="true" class="gap-3">
      <label class="flex items-center gap-2 text-sm">
        <iv-radio-group-item value="starter" />
        Starter
      </label>
      <label class="flex items-center gap-2 text-sm">
        <iv-radio-group-item value="pro" />
        Pro
      </label>
    </iv-radio-group>
  `,
})
export default class RadioGroupDisabledGroupDemo {}

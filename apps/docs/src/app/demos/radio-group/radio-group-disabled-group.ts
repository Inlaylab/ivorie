import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';

@Component({
  selector: 'demo-radio-group-disabled-group',
  imports: [IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <p class="text-muted-foreground text-sm">The whole group is disabled.</p>
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
    </div>
  `,
})
export default class RadioGroupDisabledGroupDemo {}

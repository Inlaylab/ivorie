import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_RADIO_GROUP_IMPORTS } from '@ivorie/ui/radio-group';

@Component({
  selector: 'demo-radio-group-disabled-item',
  imports: [IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-radio-group [(value)]="plan" class="gap-3">
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <iv-radio-group-item value="starter" />
        Starter
      </label>
      <label class="flex items-center gap-2 text-sm">
        <iv-radio-group-item value="enterprise" [disabled]="true" />
        Enterprise (unavailable)
      </label>
    </iv-radio-group>
  `,
})
export default class RadioGroupDisabledItemDemo {
  protected readonly plan = signal<string | null>('starter');
}

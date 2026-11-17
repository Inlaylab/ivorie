import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';

@Component({
  selector: 'demo-radio-group-disabled-item',
  imports: [IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <p class="text-muted-foreground text-sm">One item is disabled.</p>
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
    </div>
  `,
})
export default class RadioGroupDisabledItemDemo {
  protected readonly plan = signal<string | null>('starter');
}

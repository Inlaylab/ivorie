import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_RADIO_GROUP_IMPORTS } from '@ivorie/ui/radio-group';

@Component({
  selector: 'demo-radio-group-with-labels',
  imports: [IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-radio-group [(value)]="plan" class="gap-3">
      @for (option of plans; track option.value) {
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <iv-radio-group-item [value]="option.value" />
          {{ option.label }}
        </label>
      }
    </iv-radio-group>
  `,
})
export default class RadioGroupWithLabelsDemo {
  protected readonly plans = [
    { value: 'starter', label: 'Starter' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team' },
  ];
  protected readonly plan = signal<string | null>('pro');
}

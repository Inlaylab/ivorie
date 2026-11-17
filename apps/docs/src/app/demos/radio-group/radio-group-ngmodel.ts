import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';

@Component({
  selector: 'demo-radio-group-ngmodel',
  imports: [FormsModule, IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <iv-radio-group [(ngModel)]="plan" class="gap-3">
        @for (option of plans; track option.value) {
          <label class="flex cursor-pointer items-start gap-3 text-sm">
            <iv-radio-group-item [value]="option.value" class="mt-0.5" />
            <span class="grid gap-0.5">
              <span class="font-medium">{{ option.label }}</span>
              <span class="text-muted-foreground">{{ option.description }}</span>
            </span>
          </label>
        }
      </iv-radio-group>
      <p class="text-muted-foreground text-sm">Value: {{ plan() }}</p>
    </div>
  `,
})
export default class RadioGroupNgmodelDemo {
  protected readonly plans = [
    { value: 'starter', label: 'Starter', description: 'For side projects.' },
    { value: 'pro', label: 'Pro', description: 'For growing teams.' },
    { value: 'team', label: 'Team', description: 'For larger organizations.' },
  ];
  protected readonly plan = signal<string | null>('starter');
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';

@Component({
  selector: 'demo-radio-group-reactive-forms',
  imports: [ReactiveFormsModule, IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="flex flex-col gap-3">
      <iv-radio-group formControlName="plan" class="gap-3">
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
      <p class="text-muted-foreground text-sm">Value: {{ form.value.plan }}</p>
    </form>
  `,
})
export default class RadioGroupReactiveFormsDemo {
  protected readonly plans = [
    { value: 'starter', label: 'Starter', description: 'For side projects.' },
    { value: 'pro', label: 'Pro', description: 'For growing teams.' },
    { value: 'team', label: 'Team', description: 'For larger organizations.' },
  ];
  protected readonly form = new FormGroup({ plan: new FormControl('starter') });
}

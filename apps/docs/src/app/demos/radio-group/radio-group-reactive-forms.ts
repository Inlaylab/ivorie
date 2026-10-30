import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';

@Component({
  selector: 'demo-radio-group-reactive-forms',
  imports: [ReactiveFormsModule, IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="flex flex-col gap-3">
      <iv-radio-group formControlName="plan" class="gap-2">
        <iv-radio-group-item value="starter" aria-label="Starter" />
        <iv-radio-group-item value="pro" aria-label="Pro" />
        <iv-radio-group-item value="team" aria-label="Team" />
      </iv-radio-group>
      <p class="text-muted-foreground text-sm">Value: {{ form.value.plan }}</p>
    </form>
  `,
})
export default class RadioGroupReactiveFormsDemo {
  protected readonly form = new FormGroup({ plan: new FormControl('starter') });
}

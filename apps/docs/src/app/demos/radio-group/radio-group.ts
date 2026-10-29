import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_RADIO_GROUP_IMPORTS } from '@ivorie/ui/radio-group';

@Component({
  selector: 'demo-radio-group',
  imports: [IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <iv-radio-group [(value)]="plan" class="gap-2">
        <iv-radio-group-item value="starter" aria-label="Starter" />
        <iv-radio-group-item value="pro" aria-label="Pro" />
        <iv-radio-group-item value="team" aria-label="Team" />
      </iv-radio-group>
      <p class="text-muted-foreground text-sm">Plan: {{ plan() }}</p>
    </div>
  `,
})
export default class RadioGroupDemo {
  protected readonly plan = signal<string | null>('pro');
}

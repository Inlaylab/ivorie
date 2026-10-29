import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@ivorie/ui/select';

@Component({
  selector: 'demo-select-disabled-item',
  imports: [IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-select [(value)]="plan" placeholder="Pick a plan">
      <iv-select-trigger class="w-52" aria-label="Plan" />
      <iv-select-content>
        <iv-select-item value="free">Free</iv-select-item>
        <iv-select-item value="pro">Pro</iv-select-item>
        <iv-select-item value="enterprise" [disabled]="true">Enterprise (unavailable)</iv-select-item>
      </iv-select-content>
    </iv-select>
  `,
})
export default class SelectDisabledItemDemo {
  protected readonly plan = signal<string | null>(null);
}

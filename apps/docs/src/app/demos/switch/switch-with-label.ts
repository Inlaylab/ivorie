import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-with-label',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex cursor-pointer items-center gap-2 text-sm font-medium">
      <iv-switch [(checked)]="emailAlerts" />
      Email alerts
    </label>
  `,
})
export default class SwitchWithLabelDemo {
  protected readonly emailAlerts = signal(true);
}

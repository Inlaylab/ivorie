import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-with-label',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex w-72 cursor-pointer items-center justify-between gap-4 text-sm">
      <span class="grid gap-0.5">
        <span class="font-medium">Email alerts</span>
        <span class="text-muted-foreground">Send a summary to your inbox each day.</span>
      </span>
      <iv-switch [(checked)]="emailAlerts" />
    </label>
  `,
})
export default class SwitchWithLabelDemo {
  protected readonly emailAlerts = signal(true);
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <label class="flex w-72 cursor-pointer items-center justify-between gap-4 text-sm">
        <span class="grid gap-0.5">
          <span class="font-medium">Notifications</span>
          <span class="text-muted-foreground">Get notified about new activity.</span>
        </span>
        <iv-switch [(checked)]="enabled" />
      </label>
      <p class="text-muted-foreground text-sm">On: {{ enabled() }}</p>
    </div>
  `,
})
export default class SwitchDemo {
  protected readonly enabled = signal(false);
}

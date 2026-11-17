import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-ngmodel',
  imports: [FormsModule, IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <label class="flex w-72 cursor-pointer items-center justify-between gap-4 text-sm">
        <span class="grid gap-0.5">
          <span class="font-medium">Notifications</span>
          <span class="text-muted-foreground">Get notified about new activity.</span>
        </span>
        <iv-switch [(ngModel)]="notifications" />
      </label>
      <p class="text-muted-foreground text-sm">Value: {{ notifications() }}</p>
    </div>
  `,
})
export default class SwitchNgmodelDemo {
  protected readonly notifications = signal(true);
}

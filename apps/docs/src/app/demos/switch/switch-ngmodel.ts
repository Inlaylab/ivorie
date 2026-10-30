import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-ngmodel',
  imports: [FormsModule, IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-switch [(ngModel)]="notifications" aria-label="Notifications" />
      <p class="text-muted-foreground text-sm">Value: {{ notifications() }}</p>
    </div>
  `,
})
export default class SwitchNgmodelDemo {
  protected readonly notifications = signal(true);
}

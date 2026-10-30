import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-switch [(checked)]="enabled" aria-label="Notifications" />
      <p class="text-muted-foreground text-sm">On: {{ enabled() }}</p>
    </div>
  `,
})
export default class SwitchDemo {
  protected readonly enabled = signal(false);
}

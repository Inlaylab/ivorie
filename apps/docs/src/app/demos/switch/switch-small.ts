import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSwitch } from '@ivorie/ui/switch';

@Component({
  selector: 'demo-switch-small',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4">
      <iv-switch size="sm" [checked]="true" aria-label="Small" />
      <iv-switch aria-label="Default" />
    </div>
  `,
})
export default class SwitchSmallDemo {}

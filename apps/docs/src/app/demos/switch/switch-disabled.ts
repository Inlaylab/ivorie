import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-disabled',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4">
      <iv-switch [disabled]="true" aria-label="Off, disabled" />
      <iv-switch [checked]="true" [disabled]="true" aria-label="On, disabled" />
    </div>
  `,
})
export default class SwitchDisabledDemo {}

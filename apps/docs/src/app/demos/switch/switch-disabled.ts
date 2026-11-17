import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-disabled',
  imports: [IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 text-sm">
      <label class="flex items-center gap-3">
        <iv-switch [disabled]="true" />
        <span class="text-muted-foreground">Off, disabled</span>
      </label>
      <label class="flex items-center gap-3">
        <iv-switch [checked]="true" [disabled]="true" />
        <span class="text-muted-foreground">On, disabled</span>
      </label>
    </div>
  `,
})
export default class SwitchDisabledDemo {}

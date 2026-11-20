import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvGauge } from '@inlaylab/ivorie/gauge';

@Component({
  selector: 'demo-gauge-capsule',
  imports: [IvGauge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-xs gap-4">
      <iv-gauge shape="capsule" [value]="7" [max]="10" valueText="7 of 10" caption="Seats" label="Seats used" />
      <iv-gauge shape="capsule" [value]="35" caption="Battery" label="Battery" />
    </div>
  `,
})
export default class GaugeCapsuleDemo {}

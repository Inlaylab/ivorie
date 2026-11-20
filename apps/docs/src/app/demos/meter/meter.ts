import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvMeter } from '@inlaylab/ivorie/meter';

@Component({
  selector: 'demo-meter',
  imports: [IvMeter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-sm gap-6">
      <iv-meter [value]="68" label="Storage" valueText="68 GB of 100 GB" />
      <iv-meter [value]="7" [max]="10" label="Seats" valueText="7 of 10" />
    </div>
  `,
})
export default class MeterDemo {}

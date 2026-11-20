import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvMeter } from '@inlaylab/ivorie/meter';

@Component({
  selector: 'demo-meter-status',
  imports: [IvMeter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-sm gap-6">
      <iv-meter [value]="42" [low]="60" [high]="85" [optimum]="0" label="Builds this month" valueText="42 of 100" />
      <iv-meter [value]="74" [low]="60" [high]="85" [optimum]="0" label="Bandwidth" valueText="74 of 100 GB" />
      <iv-meter [value]="93" [low]="60" [high]="85" [optimum]="0" label="Storage" valueText="93 of 100 GB" />
    </div>
  `,
})
export default class MeterStatusDemo {}

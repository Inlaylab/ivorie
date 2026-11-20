import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvMeter } from '@inlaylab/ivorie/meter';

@Component({
  selector: 'demo-meter-solid',
  imports: [IvMeter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-meter [value]="3.2" [max]="5" [ticks]="0" label="Memory" valueText="3.2 of 5 GB" class="max-w-sm" />
  `,
})
export default class MeterSolidDemo {}

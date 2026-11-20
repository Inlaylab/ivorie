import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvGauge } from '@inlaylab/ivorie/gauge';

@Component({
  selector: 'demo-gauge',
  imports: [IvGauge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-center gap-8">
      <iv-gauge [value]="99.2" [min]="95" minLabel="95%" maxLabel="100%" valueText="99.2%" caption="Uptime" label="Uptime" />
      <iv-gauge [value]="41" caption="CPU" label="CPU load" class="w-32" />
    </div>
  `,
})
export default class GaugeDemo {}

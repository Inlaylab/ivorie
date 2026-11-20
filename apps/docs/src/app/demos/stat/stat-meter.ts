import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_STAT_IMPORTS } from '@inlaylab/ivorie/stat';
import { IvMeter } from '@inlaylab/ivorie/meter';

@Component({
  selector: 'demo-stat-meter',
  imports: [IV_STAT_IMPORTS, IvMeter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-stat class="w-full max-w-xs">
      <iv-stat-header><iv-stat-label>Storage</iv-stat-label></iv-stat-header>
      <iv-stat-value>68 GB</iv-stat-value>
      <iv-meter [value]="68" [ticks]="20" aria-label="Storage used" />
      <iv-stat-description>32 GB left on the Pro plan</iv-stat-description>
    </iv-stat>
  `,
})
export default class StatMeterDemo {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_STAT_IMPORTS } from '@inlaylab/ivorie/stat';
import { IvDelta } from '@inlaylab/ivorie/delta';
import { IvSparkline } from '@inlaylab/ivorie/sparkline';

@Component({
  selector: 'demo-stat',
  imports: [IV_STAT_IMPORTS, IvDelta, IvSparkline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full gap-4 sm:grid-cols-2">
      @for (s of stats; track s.label) {
        <iv-stat>
          <iv-stat-header>
            <iv-stat-icon>{{ s.glyph }}</iv-stat-icon>
            <iv-stat-label>{{ s.label }}</iv-stat-label>
          </iv-stat-header>
          <iv-stat-value>{{ s.value }} <iv-delta [value]="s.delta" [invert]="s.invert" /></iv-stat-value>
          <div class="flex items-end justify-between gap-3">
            <iv-stat-description>vs. last month</iv-stat-description>
            <svg ivSparkline [data]="s.trend" type="area"></svg>
          </div>
        </iv-stat>
      }
    </div>
  `,
})
export default class StatDemo {
  protected readonly stats = [
    { glyph: '$', label: 'Revenue', value: '$48,200', delta: 12, invert: false, trend: [31, 34, 33, 38, 41, 40, 48] },
    { glyph: 'ms', label: 'Response time', value: '182 ms', delta: -8.4, invert: true, trend: [240, 226, 230, 210, 198, 190, 182] },
  ];
}

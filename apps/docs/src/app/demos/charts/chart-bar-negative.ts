import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-bar-negative',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Bar Chart - Negative</iv-card-title>
        <iv-card-description>January - June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-chart [config]="config">
          <svg ivBarChart [data]="data">
            <g ivCartesianGrid [vertical]="false" />
            <g ivBar dataKey="visitors">
              <g ivLabelList position="top" dataKey="month" />
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel hideIndicator />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col items-start gap-2 text-sm">
        <div class="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <ng-icon [svg]="trendingUp" size="16" />
        </div>
        <div class="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export default class ChartBarNegative {
  protected readonly data = [
    { month: 'January', visitors: 186 },
    { month: 'February', visitors: 205 },
    { month: 'March', visitors: -207 },
    { month: 'April', visitors: 173 },
    { month: 'May', visitors: -209 },
    { month: 'June', visitors: 214 },
  ].map((row) => ({ ...row, fill: row.visitors > 0 ? 'var(--chart-1)' : 'var(--chart-2)' }));

  protected readonly config: IvChartConfig = {
    visitors: { label: 'Visitors' },
  };

  protected readonly trendingUp = lucideTrendingUp;
}

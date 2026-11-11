import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-bar-stacked',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Bar Chart - Stacked + Legend</iv-card-title>
        <iv-card-description>January - June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-chart [config]="config">
          <svg ivBarChart [data]="data">
            <g ivCartesianGrid [vertical]="false" />
            <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="10" [tickFormatter]="short" />
            <g ivBar dataKey="desktop" stackId="a" [radius]="[0, 0, 4, 4]" />
            <g ivBar dataKey="mobile" stackId="a" [radius]="[4, 4, 0, 0]" />
          </svg>
          <iv-chart-tooltip hideLabel />
          <iv-chart-legend />
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
export default class ChartBarStacked {
  protected readonly data = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
  ];

  protected readonly config: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  };

  protected readonly trendingUp = lucideTrendingUp;

  protected readonly short = (month: string) => month.slice(0, 3);
}

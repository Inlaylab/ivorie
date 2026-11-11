import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-area-gradient',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Area Chart - Gradient</iv-card-title>
        <iv-card-description>Showing total visitors for the last 6 months</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-chart [config]="config">
          <svg ivAreaChart [data]="data" [margin]="{ left: 12, right: 12 }">
            <g ivCartesianGrid [vertical]="false" />
            <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="8" [tickFormatter]="short" />
            <defs>
              <linearGradient id="gradient-fill-desktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="var(--color-desktop)" stop-opacity="0.8" />
                <stop offset="95%" stop-color="var(--color-desktop)" stop-opacity="0.1" />
              </linearGradient>
              <linearGradient id="gradient-fill-mobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="var(--color-mobile)" stop-opacity="0.8" />
                <stop offset="95%" stop-color="var(--color-mobile)" stop-opacity="0.1" />
              </linearGradient>
            </defs>
            <g ivArea dataKey="mobile" curve="natural" fill="url(#gradient-fill-mobile)" stackId="a" />
            <g ivArea dataKey="desktop" curve="natural" fill="url(#gradient-fill-desktop)" stackId="a" />
          </svg>
          <iv-chart-tooltip [cursor]="false" />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer>
        <div class="flex w-full items-start gap-2 text-sm">
          <div class="grid gap-2">
            <div class="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <ng-icon [svg]="trendingUp" size="16" />
            </div>
            <div class="text-muted-foreground flex items-center gap-2 leading-none">January - June 2024</div>
          </div>
        </div>
      </iv-card-footer>
    </iv-card>
  `,
})
export default class ChartAreaGradient {
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

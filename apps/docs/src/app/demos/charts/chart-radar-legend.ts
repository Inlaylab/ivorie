import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-radar-legend',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header class="items-center pb-4">
        <iv-card-title>Radar Chart - Legend</iv-card-title>
        <iv-card-description>Showing total visitors for the last 6 months</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[250px]">
          <svg ivRadarChart [data]="data" [margin]="{ top: -40, bottom: -10, left: 0, right: 0 }">
            <g ivPolarAngleAxis dataKey="month" />
            <g ivPolarGrid />
            <g ivRadar dataKey="desktop" [fillOpacity]="0.6" />
            <g ivRadar dataKey="mobile" />
          </svg>
          <iv-chart-tooltip [cursor]="false" indicator="line" />
          <iv-chart-legend class="mt-8" />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2 pt-4 text-sm">
        <div class="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <ng-icon [svg]="trendingUp" size="16" />
        </div>
        <div class="text-muted-foreground flex items-center gap-2 leading-none">
          January - June 2024
        </div>
      </iv-card-footer>
    </iv-card>
  `,
})
export default class ChartRadarLegend {
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
}

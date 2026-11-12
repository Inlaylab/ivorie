import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-radar-lines-only',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header class="items-center pb-4">
        <iv-card-title>Radar Chart - Lines Only</iv-card-title>
        <iv-card-description>Showing total visitors for the last 6 months</iv-card-description>
      </iv-card-header>
      <iv-card-content class="pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[250px]">
          <svg ivRadarChart [data]="data">
            <g ivPolarAngleAxis dataKey="month" />
            <g ivPolarGrid [radialLines]="false" />
            <g
              ivRadar
              dataKey="desktop"
              [fillOpacity]="0"
              stroke="var(--color-desktop)"
              [strokeWidth]="2"
            />
            <g
              ivRadar
              dataKey="mobile"
              [fillOpacity]="0"
              stroke="var(--color-mobile)"
              [strokeWidth]="2"
            />
          </svg>
          <iv-chart-tooltip [cursor]="false" indicator="line" />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2 text-sm">
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
export default class ChartRadarLinesOnly {
  protected readonly data = [
    { month: 'January', desktop: 186, mobile: 160 },
    { month: 'February', desktop: 185, mobile: 170 },
    { month: 'March', desktop: 207, mobile: 180 },
    { month: 'April', desktop: 173, mobile: 160 },
    { month: 'May', desktop: 160, mobile: 190 },
    { month: 'June', desktop: 174, mobile: 204 },
  ];

  protected readonly config: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  };

  protected readonly trendingUp = lucideTrendingUp;
}

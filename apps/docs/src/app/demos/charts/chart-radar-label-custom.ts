import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-radar-label-custom',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header class="items-center pb-4">
        <iv-card-title>Radar Chart - Custom Label</iv-card-title>
        <iv-card-description>Showing total visitors for the last 6 months</iv-card-description>
      </iv-card-header>
      <iv-card-content class="pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[250px]">
          <svg ivRadarChart [data]="data" [margin]="{ top: 10, right: 10, bottom: 10, left: 10 }">
            <g ivPolarAngleAxis dataKey="month" [tick]="tick" />
            <ng-template #tick let-t>
              <svg:text
                [attr.x]="t.x"
                [attr.y]="t.y + (t.index === 0 ? -10 : 0)"
                [attr.text-anchor]="t.textAnchor"
                font-size="13"
                font-weight="500"
              >
                <svg:tspan>{{ data[t.index].desktop }}</svg:tspan>
                <svg:tspan class="fill-muted-foreground">/</svg:tspan>
                <svg:tspan>{{ data[t.index].mobile }}</svg:tspan>
                <svg:tspan [attr.x]="t.x" dy="1rem" font-size="12" class="fill-muted-foreground">
                  {{ data[t.index].month }}
                </svg:tspan>
              </svg:text>
            </ng-template>
            <g ivPolarGrid />
            <g ivRadar dataKey="desktop" [fillOpacity]="0.6" />
            <g ivRadar dataKey="mobile" />
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
export default class ChartRadarLabelCustom {
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

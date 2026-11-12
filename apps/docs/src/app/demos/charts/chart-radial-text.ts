import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-radial-text',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md flex flex-col">
      <iv-card-header class="items-center pb-0">
        <iv-card-title>Radial Chart - Text</iv-card-title>
        <iv-card-description>January - June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1 pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[250px]">
          <svg
            ivRadialChart
            [data]="data"
            [startAngle]="0"
            [endAngle]="250"
            [outerRadius]="90"
            [innerRadius]="80"
          >
            <g
              ivPolarGrid
              gridType="circle"
              [radialLines]="false"
              stroke="none"
              class="first:fill-muted last:fill-background"
              [polarRadius]="[90, 80]"
            />
            <g ivRadialBar dataKey="visitors" background [cornerRadius]="10" />
            <g ivPolarRadiusAxis>
              <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                <svg:text
                  [attr.x]="cx"
                  [attr.y]="cy"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  <svg:tspan [attr.x]="cx" [attr.y]="cy" class="fill-foreground text-4xl font-bold">
                    {{ data[0].visitors.toLocaleString() }}
                  </svg:tspan>
                  <svg:tspan [attr.x]="cx" [attr.y]="cy + 24" class="fill-muted-foreground">
                    Visitors
                  </svg:tspan>
                </svg:text>
              </ng-template>
            </g>
          </svg>
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2 text-sm">
        <div class="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <ng-icon [svg]="trendingUp" size="16" />
        </div>
        <div class="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </iv-card-footer>
    </iv-card>
  `,
})
export default class ChartRadialText {
  protected readonly data = [{ browser: 'safari', visitors: 200, fill: 'var(--color-safari)' }];

  protected readonly config: IvChartConfig = {
    visitors: { label: 'Visitors' },
    safari: { label: 'Safari', color: 'var(--chart-2)' },
  };

  protected readonly trendingUp = lucideTrendingUp;
}

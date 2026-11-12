import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-radial-stacked',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md flex flex-col">
      <iv-card-header class="items-center pb-0">
        <iv-card-title>Radial Chart - Stacked</iv-card-title>
        <iv-card-description>January - June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-1 items-center pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square w-full max-w-[250px]">
          <svg ivRadialChart [data]="data" [endAngle]="180" [innerRadius]="80" [outerRadius]="110">
            <g
              ivRadialBar
              dataKey="mobile"
              fill="var(--color-mobile)"
              stackId="a"
              [cornerRadius]="5"
              class="stroke-transparent stroke-2"
            />
            <g
              ivRadialBar
              dataKey="desktop"
              stackId="a"
              [cornerRadius]="5"
              fill="var(--color-desktop)"
              class="stroke-transparent stroke-2"
            />
            <g ivPolarRadiusAxis>
              <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                <svg:text [attr.x]="cx" [attr.y]="cy" text-anchor="middle">
                  <svg:tspan
                    [attr.x]="cx"
                    [attr.y]="cy - 16"
                    class="fill-foreground text-2xl font-bold"
                  >
                    {{ total.toLocaleString() }}
                  </svg:tspan>
                  <svg:tspan [attr.x]="cx" [attr.y]="cy + 4" class="fill-muted-foreground">
                    Visitors
                  </svg:tspan>
                </svg:text>
              </ng-template>
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel />
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
export default class ChartRadialStacked {
  protected readonly data = [{ month: 'january', desktop: 1260, mobile: 570 }];

  protected readonly config: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  };

  protected readonly trendingUp = lucideTrendingUp;

  protected readonly total = this.data[0].desktop + this.data[0].mobile;
}

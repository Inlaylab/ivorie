import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-bar-active',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Bar Chart - Active</iv-card-title>
        <iv-card-description>January - June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-chart [config]="config">
          <svg ivBarChart [data]="data">
            <g ivCartesianGrid [vertical]="false" />
            <g ivXAxis dataKey="browser" [tickLine]="false" [tickMargin]="10" [axisLine]="false" [tickFormatter]="label" />
            <g ivBar dataKey="visitors" [radius]="8" [activeIndex]="2">
              <ng-template ivActiveShape let-bar>
                <svg:path
                  [attr.d]="bar.d"
                  [attr.fill]="bar.fill"
                  fill-opacity="0.8"
                  [attr.stroke]="bar.fill"
                  stroke-width="2"
                  stroke-dasharray="4"
                  stroke-dashoffset="4"
                />
              </ng-template>
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel />
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
export default class ChartBarActive {
  protected readonly data = [
    { browser: 'chrome', visitors: 187, fill: 'var(--color-chrome)' },
    { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
    { browser: 'firefox', visitors: 275, fill: 'var(--color-firefox)' },
    { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
    { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
  ];

  protected readonly config: IvChartConfig = {
    visitors: { label: 'Visitors' },
    chrome: { label: 'Chrome', color: 'var(--chart-1)' },
    safari: { label: 'Safari', color: 'var(--chart-2)' },
    firefox: { label: 'Firefox', color: 'var(--chart-3)' },
    edge: { label: 'Edge', color: 'var(--chart-4)' },
    other: { label: 'Other', color: 'var(--chart-5)' },
  };

  protected readonly trendingUp = lucideTrendingUp;

  /** The config label of a browser key. */
  protected readonly label = (browser: string) => this.config[browser]?.label ?? browser;
}

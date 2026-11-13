import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-pie-legend',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md flex flex-col">
      <iv-card-header class="items-center pb-0">
        <iv-card-title>Pie Chart - Legend</iv-card-title>
        <iv-card-description>January - June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1 pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[300px]">
          <svg ivPieChart>
            <g ivPie [data]="data" dataKey="visitors" />
          </svg>
          <iv-chart-legend
            nameKey="browser"
            class="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
          />
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export default class ChartPieLegend {
  protected readonly data = [
    { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
    { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
    { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
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
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig, IvChartPayload } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-pie-stacked',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md flex flex-col">
      <iv-card-header class="items-center pb-0">
        <iv-card-title>Pie Chart - Stacked</iv-card-title>
        <iv-card-description>January - June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1 pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[250px]">
          <svg ivPieChart>
            <g ivPie [data]="desktop" dataKey="desktop" [outerRadius]="60" />
            <g ivPie [data]="mobile" dataKey="mobile" [innerRadius]="70" [outerRadius]="90" />
          </svg>
          <iv-chart-tooltip
            labelKey="visitors"
            nameKey="month"
            indicator="line"
            [labelFormatter]="series"
          />
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
export default class ChartPieStacked {
  protected readonly config: IvChartConfig = {
    visitors: { label: 'Visitors' },
    desktop: { label: 'Desktop' },
    mobile: { label: 'Mobile' },
    january: { label: 'January', color: 'var(--chart-1)' },
    february: { label: 'February', color: 'var(--chart-2)' },
    march: { label: 'March', color: 'var(--chart-3)' },
    april: { label: 'April', color: 'var(--chart-4)' },
    may: { label: 'May', color: 'var(--chart-5)' },
  };

  protected readonly trendingUp = lucideTrendingUp;

  protected readonly desktop = [
    { month: 'january', desktop: 186, fill: 'var(--color-january)' },
    { month: 'february', desktop: 305, fill: 'var(--color-february)' },
    { month: 'march', desktop: 237, fill: 'var(--color-march)' },
    { month: 'april', desktop: 173, fill: 'var(--color-april)' },
    { month: 'may', desktop: 209, fill: 'var(--color-may)' },
  ];

  protected readonly mobile = [
    { month: 'january', mobile: 80, fill: 'var(--color-january)' },
    { month: 'february', mobile: 200, fill: 'var(--color-february)' },
    { month: 'march', mobile: 120, fill: 'var(--color-march)' },
    { month: 'april', mobile: 190, fill: 'var(--color-april)' },
    { month: 'may', mobile: 130, fill: 'var(--color-may)' },
  ];

  /** The label names the ring: Desktop or Mobile. */
  protected readonly series = (_: unknown, payload: IvChartPayload[]) =>
    String(this.config[payload[0]?.key]?.label ?? '');
}

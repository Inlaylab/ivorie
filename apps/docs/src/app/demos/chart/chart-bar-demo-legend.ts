import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-bar-demo-legend',
  imports: [IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-chart [config]="config" class="min-h-[200px] w-full">
      <svg ivBarChart [data]="data">
        <g ivCartesianGrid [vertical]="false" />
        <g
          ivXAxis
          dataKey="month"
          [tickLine]="false"
          [tickMargin]="10"
          [axisLine]="false"
          [tickFormatter]="short"
        />
        <g ivBar dataKey="desktop" [radius]="4" />
        <g ivBar dataKey="mobile" [radius]="4" />
      </svg>
      <iv-chart-tooltip />
      <iv-chart-legend />
    </iv-chart>
  `,
})
export default class ChartBarDemoLegend {
  protected readonly data = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
  ];

  protected readonly config: IvChartConfig = {
    desktop: { label: 'Desktop', color: '#2563eb' },
    mobile: { label: 'Mobile', color: '#60a5fa' },
  };

  protected readonly short = (month: string) => month.slice(0, 3);
}

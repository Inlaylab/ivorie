import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-tooltip-label-custom',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Tooltip - Custom label</iv-card-title>
        <iv-card-description>Tooltip with custom label from chartConfig.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-chart [config]="config">
          <svg ivBarChart [data]="data">
            <g
              ivXAxis
              dataKey="date"
              [tickLine]="false"
              [tickMargin]="10"
              [axisLine]="false"
              [tickFormatter]="weekday"
            />
            <g ivBar dataKey="running" stackId="a" [radius]="[0, 0, 4, 4]" />
            <g ivBar dataKey="swimming" stackId="a" [radius]="[4, 4, 0, 0]" />
          </svg>
          <iv-chart-tooltip
            labelKey="activities"
            indicator="line"
            [cursor]="false"
            [defaultIndex]="1"
          />
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export default class ChartTooltipLabelCustom {
  protected readonly data = [
    { date: '2024-07-15', running: 450, swimming: 300 },
    { date: '2024-07-16', running: 380, swimming: 420 },
    { date: '2024-07-17', running: 520, swimming: 120 },
    { date: '2024-07-18', running: 140, swimming: 550 },
    { date: '2024-07-19', running: 600, swimming: 350 },
    { date: '2024-07-20', running: 480, swimming: 400 },
  ];

  protected readonly config: IvChartConfig = {
    activities: { label: 'Activities' },
    running: { label: 'Running', color: 'var(--chart-1)' },
    swimming: { label: 'Swimming', color: 'var(--chart-2)' },
  };

  /** Dates are UTC days: format them in UTC, so server and browser agree. */
  protected readonly weekday = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

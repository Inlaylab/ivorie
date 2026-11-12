import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig, IvChartDatum } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-tooltip-advanced',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Tooltip - Advanced</iv-card-title>
        <iv-card-description>Tooltip with custom formatter and total.</iv-card-description>
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
          <iv-chart-tooltip hideLabel class="w-[180px]" [cursor]="false" [defaultIndex]="1">
            <ng-template
              ivChartTooltipItem
              let-item
              let-label="label"
              let-name="name"
              let-index="index"
            >
              <div
                class="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                [style.--color-bg]="'var(--color-' + name + ')'"
              ></div>
              {{ label }}
              <div
                class="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums"
              >
                {{ item.value }}
                <span class="font-normal text-muted-foreground">kcal</span>
              </div>
              <!-- After the last item -->
              @if (index === 1) {
                <div
                  class="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground"
                >
                  Total
                  <div
                    class="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums"
                  >
                    {{ total(item.row) }}
                    <span class="font-normal text-muted-foreground">kcal</span>
                  </div>
                </div>
              }
            </ng-template>
          </iv-chart-tooltip>
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export default class ChartTooltipAdvanced {
  protected readonly data = [
    { date: '2024-07-15', running: 450, swimming: 300 },
    { date: '2024-07-16', running: 380, swimming: 420 },
    { date: '2024-07-17', running: 520, swimming: 120 },
    { date: '2024-07-18', running: 140, swimming: 550 },
    { date: '2024-07-19', running: 600, swimming: 350 },
    { date: '2024-07-20', running: 480, swimming: 400 },
  ];

  protected readonly config: IvChartConfig = {
    running: { label: 'Running', color: 'var(--chart-1)' },
    swimming: { label: 'Swimming', color: 'var(--chart-2)' },
  };

  /** Dates are UTC days: format them in UTC, so server and browser agree. */
  protected readonly weekday = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

  protected readonly total = (row: IvChartDatum) =>
    Number(row['running']) + Number(row['swimming']);
}

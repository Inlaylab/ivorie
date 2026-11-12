import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideActivity, lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

/** A config icon: any component. This one wraps an ng-icon. */
@Component({
  selector: 'demo-activity-icon',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex text-muted-foreground' },
  template: `<ng-icon [svg]="icon" />`,
})
class ActivityIcon {
  protected readonly icon = lucideActivity;
}

@Component({
  selector: 'demo-chart-area-step',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Area Chart - Step</iv-card-title>
        <iv-card-description>Showing total visitors for the last 6 months</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-chart [config]="config">
          <svg ivAreaChart [data]="data" [margin]="{ left: 12, right: 12 }">
            <g ivCartesianGrid [vertical]="false" />
            <g
              ivXAxis
              dataKey="month"
              [tickLine]="false"
              [axisLine]="false"
              [tickMargin]="8"
              [tickFormatter]="short"
            />
            <g ivArea dataKey="desktop" curve="step" [fillOpacity]="0.4" />
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer>
        <div class="flex w-full items-start gap-2 text-sm">
          <div class="grid gap-2">
            <div class="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <ng-icon [svg]="trendingUp" size="16" />
            </div>
            <div class="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </iv-card-footer>
    </iv-card>
  `,
})
export default class ChartAreaStep {
  protected readonly data = [
    { month: 'January', desktop: 186 },
    { month: 'February', desktop: 305 },
    { month: 'March', desktop: 237 },
    { month: 'April', desktop: 73 },
    { month: 'May', desktop: 209 },
    { month: 'June', desktop: 214 },
  ];

  protected readonly config: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)', icon: ActivityIcon },
  };

  protected readonly trendingUp = lucideTrendingUp;

  protected readonly short = (month: string) => month.slice(0, 3);
}

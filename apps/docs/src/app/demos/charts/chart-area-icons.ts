import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideTrendingDown, lucideTrendingUp } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

/** Config icons: any component. These wrap an ng-icon. */
@Component({
  selector: 'demo-trending-down-icon',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex text-muted-foreground' },
  template: `<ng-icon [svg]="icon" />`,
})
class TrendingDownIcon {
  protected readonly icon = lucideTrendingDown;
}

@Component({
  selector: 'demo-trending-up-icon',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex text-muted-foreground' },
  template: `<ng-icon [svg]="icon" />`,
})
class TrendingUpIcon {
  protected readonly icon = lucideTrendingUp;
}

@Component({
  selector: 'demo-chart-area-icons',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Area Chart - Icons</iv-card-title>
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
            <g ivArea dataKey="mobile" curve="natural" [fillOpacity]="0.4" stackId="a" />
            <g ivArea dataKey="desktop" curve="natural" [fillOpacity]="0.4" stackId="a" />
          </svg>
          <iv-chart-tooltip [cursor]="false" indicator="line" />
          <iv-chart-legend />
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
export default class ChartAreaIcons {
  protected readonly data = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
  ];

  protected readonly config: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)', icon: TrendingDownIcon },
    mobile: { label: 'Mobile', color: 'var(--chart-2)', icon: TrendingUpIcon },
  };

  protected readonly trendingUp = lucideTrendingUp;

  protected readonly short = (month: string) => month.slice(0, 3);
}

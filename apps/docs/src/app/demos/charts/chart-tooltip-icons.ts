import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideFootprints, lucideWaves } from '@ng-icons/lucide';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart';

/** Config icons: any component. These wrap an ng-icon. */
@Component({
  selector: 'demo-footprints-icon',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex text-muted-foreground' },
  template: `<ng-icon [svg]="icon" />`,
})
class FootprintsIcon {
  protected readonly icon = lucideFootprints;
}

@Component({
  selector: 'demo-waves-icon',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex text-muted-foreground' },
  template: `<ng-icon [svg]="icon" />`,
})
class WavesIcon {
  protected readonly icon = lucideWaves;
}

@Component({
  selector: 'demo-chart-tooltip-icons',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md">
      <iv-card-header>
        <iv-card-title>Tooltip - Icons</iv-card-title>
        <iv-card-description>Tooltip with icons.</iv-card-description>
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
          <iv-chart-tooltip hideLabel [cursor]="false" [defaultIndex]="1" />
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export default class ChartTooltipIcons {
  protected readonly data = [
    { date: '2024-07-15', running: 450, swimming: 300 },
    { date: '2024-07-16', running: 380, swimming: 420 },
    { date: '2024-07-17', running: 520, swimming: 120 },
    { date: '2024-07-18', running: 140, swimming: 550 },
    { date: '2024-07-19', running: 600, swimming: 350 },
    { date: '2024-07-20', running: 480, swimming: 400 },
  ];

  protected readonly config: IvChartConfig = {
    running: { label: 'Running', color: 'var(--chart-1)', icon: FootprintsIcon },
    swimming: { label: 'Swimming', color: 'var(--chart-2)', icon: WavesIcon },
  };

  /** Dates are UTC days: format them in UTC, so server and browser agree. */
  protected readonly weekday = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

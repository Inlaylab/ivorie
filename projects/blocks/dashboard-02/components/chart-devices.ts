import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingUp } from '@ng-icons/lucide'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { DeviceSessions } from '../data'

/** Monthly sessions stacked by device. */
@Component({
  selector: 'app-dashboard-02-chart-devices',
  imports: [NgIcon, IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header>
        <iv-card-title>Sessions by Device</iv-card-title>
        <iv-card-description>January – June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1">
        <iv-chart [config]="config" class="aspect-auto h-[250px] w-full">
          <svg ivBarChart [data]="data()">
            <g ivCartesianGrid [vertical]="false" />
            <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="10" [tickFormatter]="short" />
            <g ivBar dataKey="desktop" stackId="a" [radius]="[0, 0, 4, 4]" />
            <g ivBar dataKey="mobile" stackId="a" />
            <g ivBar dataKey="tablet" stackId="a" [radius]="[4, 4, 0, 0]" />
          </svg>
          <iv-chart-tooltip />
          <iv-chart-legend />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col items-start gap-2 text-sm">
        <div class="flex gap-2 leading-none font-medium">Mobile up 57% since January <ng-icon [svg]="trendingUp" size="16" /></div>
        <div class="text-muted-foreground leading-none">Desktop still brings half of all sessions</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export class ChartDevices {
  readonly data = input.required<DeviceSessions[]>()

  protected readonly config: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' },
    tablet: { label: 'Tablet', color: 'var(--chart-3)' },
  }
  protected readonly trendingUp = lucideTrendingUp
  protected readonly short = (month: string) => month.slice(0, 3)
}

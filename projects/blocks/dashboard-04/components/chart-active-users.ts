import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { DailyUsers } from '../data'

/** Daily active users over the last 30 days, as a line. */
@Component({
  selector: 'app-dashboard-04-chart-active-users',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card>
      <iv-card-header>
        <iv-card-title>Daily Active Users</iv-card-title>
        <iv-card-description>June 2024: weekdays peak, weekends dip</iv-card-description>
      </iv-card-header>
      <iv-card-content class="px-2 sm:px-6">
        <iv-chart [config]="config" class="aspect-auto h-[250px] w-full">
          <svg ivLineChart [data]="data()" [margin]="{ left: 12, right: 20 }">
            <g ivCartesianGrid [vertical]="false" />
            <g ivXAxis dataKey="date" [tickLine]="false" [axisLine]="false" [tickMargin]="8" [minTickGap]="32" [tickFormatter]="day" />
            <g ivYAxis [tickLine]="false" [axisLine]="false" [tickMargin]="8" [width]="40" />
            <g ivLine dataKey="users" curve="monotone" [strokeWidth]="2" [dot]="false" />
          </svg>
          <iv-chart-tooltip [labelFormatter]="day" indicator="line" />
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export class ChartActiveUsers {
  readonly data = input.required<DailyUsers[]>()

  protected readonly config: IvChartConfig = {
    users: { label: 'Active users', color: 'var(--chart-2)' },
  }

  /** Format in UTC, so the server and the browser print the same day. */
  protected readonly day = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

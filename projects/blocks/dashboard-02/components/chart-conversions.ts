import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingUp } from '@ng-icons/lucide'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { Conversions } from '../data'

/** Monthly sign-ups and trials, one line each. */
@Component({
  selector: 'app-dashboard-02-chart-conversions',
  imports: [NgIcon, IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header>
        <iv-card-title>Conversions</iv-card-title>
        <iv-card-description>Sign-ups and trials started, January – June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1">
        <iv-chart [config]="config" class="aspect-auto h-[250px] w-full">
          <svg ivLineChart [data]="data()" [margin]="{ left: 12, right: 12 }">
            <g ivCartesianGrid [vertical]="false" />
            <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="8" [tickFormatter]="short" />
            <g ivLine dataKey="signups" curve="monotone" [strokeWidth]="2" [dot]="false" />
            <g ivLine dataKey="trials" curve="monotone" [strokeWidth]="2" [dot]="false" />
          </svg>
          <iv-chart-tooltip [cursor]="false" />
          <iv-chart-legend />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col items-start gap-2 text-sm">
        <div class="flex gap-2 leading-none font-medium">Trials up 70% since January <ng-icon [svg]="trendingUp" size="16" /></div>
        <div class="text-muted-foreground leading-none">53% of sign-ups start a trial</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export class ChartConversions {
  readonly data = input.required<Conversions[]>()

  protected readonly config: IvChartConfig = {
    signups: { label: 'Sign-ups', color: 'var(--chart-1)' },
    trials: { label: 'Trials', color: 'var(--chart-2)' },
  }
  protected readonly trendingUp = lucideTrendingUp
  protected readonly short = (month: string) => month.slice(0, 3)
}

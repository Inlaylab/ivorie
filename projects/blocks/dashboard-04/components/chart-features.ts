import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingUp } from '@ng-icons/lucide'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { FeatureUsage } from '../data'

/** Feature usage this month over last month, as two radar shapes. */
@Component({
  selector: 'app-dashboard-04-chart-features',
  imports: [NgIcon, IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header class="items-center pb-4">
        <iv-card-title>Feature Usage</iv-card-title>
        <iv-card-description>Share of active users, June vs May</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1 pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[250px]">
          <svg ivRadarChart [data]="data()">
            <g ivPolarAngleAxis dataKey="feature" />
            <g ivPolarGrid />
            <g ivRadar dataKey="previous" />
            <g ivRadar dataKey="current" [fillOpacity]="0.6" />
          </svg>
          <iv-chart-tooltip [cursor]="false" indicator="line" />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2 text-sm">
        <div class="flex items-center gap-2 leading-none font-medium">Alerts up 14 points <ng-icon [svg]="trendingUp" size="16" /></div>
        <div class="text-muted-foreground leading-none">Exports dipped after the CSV change</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export class ChartFeatures {
  readonly data = input.required<FeatureUsage[]>()

  protected readonly config: IvChartConfig = {
    current: { label: 'June', color: 'var(--chart-1)' },
    previous: { label: 'May', color: 'var(--chart-2)' },
  }
  protected readonly trendingUp = lucideTrendingUp
}

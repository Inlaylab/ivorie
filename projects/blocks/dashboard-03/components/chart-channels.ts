import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingUp } from '@ng-icons/lucide'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { ChannelRevenue } from '../data'

/** Revenue by channel as a donut, with the total in the middle. */
@Component({
  selector: 'app-dashboard-03-chart-channels',
  imports: [NgIcon, IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header class="items-center pb-0">
        <iv-card-title>Revenue by Channel</iv-card-title>
        <iv-card-description>June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1 pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square max-h-[300px]">
          <svg ivPieChart>
            <g ivPie [data]="data()" dataKey="revenue" nameKey="channel" [innerRadius]="60" [strokeWidth]="5">
              <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                <svg:text [attr.x]="cx" [attr.y]="cy" text-anchor="middle" dominant-baseline="middle">
                  <svg:tspan [attr.x]="cx" [attr.y]="cy" class="fill-foreground text-2xl font-bold">{{ total() }}</svg:tspan>
                  <svg:tspan [attr.x]="cx" [attr.y]="cy + 24" class="fill-muted-foreground">Revenue</svg:tspan>
                </svg:text>
              </ng-template>
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel />
          <iv-chart-legend nameKey="channel" class="flex-wrap gap-x-4 gap-y-1" />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2 text-sm">
        <div class="flex items-center gap-2 leading-none font-medium">Online up 24% this month <ng-icon [svg]="trendingUp" size="16" /></div>
        <div class="text-muted-foreground leading-none">The online store brings 41% of revenue</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export class ChartChannels {
  readonly data = input.required<ChannelRevenue[]>()

  protected readonly config: IvChartConfig = {
    revenue: { label: 'Revenue' },
    online: { label: 'Online', color: 'var(--chart-1)' },
    retail: { label: 'Retail', color: 'var(--chart-2)' },
    wholesale: { label: 'Wholesale', color: 'var(--chart-3)' },
    marketplace: { label: 'Marketplace', color: 'var(--chart-4)' },
    social: { label: 'Social', color: 'var(--chart-5)' },
  }
  protected readonly trendingUp = lucideTrendingUp
  protected readonly total = computed(
    () => '$' + this.data().reduce((sum, row) => sum + row.revenue, 0).toLocaleString('en-US'),
  )
}

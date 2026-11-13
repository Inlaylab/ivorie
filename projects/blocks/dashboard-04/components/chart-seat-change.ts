import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingUp } from '@ng-icons/lucide'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { SeatChange } from '../data'

/** Seats gained or lost each month: bars grow up or down from zero. */
@Component({
  selector: 'app-dashboard-04-chart-seat-change',
  imports: [NgIcon, IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header>
        <iv-card-title>Net Seat Change</iv-card-title>
        <iv-card-description>January – June 2024</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1">
        <iv-chart [config]="config" class="aspect-auto h-[250px] w-full">
          <svg ivBarChart [data]="rows()" [margin]="{ top: 20, bottom: 20 }">
            <g ivCartesianGrid [vertical]="false" />
            <g ivBar dataKey="seats" [radius]="4">
              <g ivLabelList position="top" dataKey="month" [formatter]="short" class="fill-foreground" />
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideIndicator />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col items-start gap-2 text-sm">
        <div class="flex gap-2 leading-none font-medium">{{ net() }} seats in six months <ng-icon [svg]="trendingUp" size="16" /></div>
        <div class="text-muted-foreground leading-none">Two months lost seats to team cleanups</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export class ChartSeatChange {
  readonly data = input.required<SeatChange[]>()

  protected readonly config: IvChartConfig = {
    seats: { label: 'Net seats' },
    gained: { label: 'Gained', color: 'var(--chart-1)' },
    lost: { label: 'Lost', color: 'var(--chart-3)' },
  }
  protected readonly trendingUp = lucideTrendingUp
  /** Each bar takes the color of its sign. */
  protected readonly rows = computed(() =>
    this.data().map((row) => ({ ...row, fill: row.seats >= 0 ? 'var(--color-gained)' : 'var(--color-lost)' })),
  )
  protected readonly net = computed(() => {
    const total = this.data().reduce((sum, row) => sum + row.seats, 0)
    return (total >= 0 ? '+' : '') + total
  })
  protected readonly short = (month: unknown) => String(month).slice(0, 3)
}

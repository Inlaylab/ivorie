import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'

/** Progress to this month's revenue target, as a ring that fills clockwise from the top. */
@Component({
  selector: 'app-dashboard-03-chart-goal',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header class="items-center pb-0">
        <iv-card-title>Monthly Target</iv-card-title>
        <iv-card-description>{{ money(goal().target) }} by June 30</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-1 items-center pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square w-full max-h-[300px]">
          <svg ivRadialChart [data]="rows()" [startAngle]="90" [endAngle]="endAngle()" [innerRadius]="80" [outerRadius]="110">
            <g
              ivPolarGrid
              gridType="circle"
              [radialLines]="false"
              stroke="none"
              class="first:fill-muted last:fill-background"
              [polarRadius]="[86, 74]"
            />
            <g ivRadialBar dataKey="revenue" [cornerRadius]="10" background />
            <g ivPolarRadiusAxis>
              <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                <svg:text [attr.x]="cx" [attr.y]="cy" text-anchor="middle" dominant-baseline="middle">
                  <svg:tspan [attr.x]="cx" [attr.y]="cy" class="fill-foreground text-4xl font-bold">{{ percent() }}%</svg:tspan>
                  <svg:tspan [attr.x]="cx" [attr.y]="cy + 24" class="fill-muted-foreground">of target</svg:tspan>
                </svg:text>
              </ng-template>
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2 text-sm">
        <div class="leading-none font-medium">{{ money(goal().target - goal().revenue) }} to go</div>
        <div class="text-muted-foreground leading-none">{{ money(goal().revenue) }} booked so far</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export class ChartGoal {
  readonly goal = input.required<{ revenue: number; target: number }>()

  protected readonly config: IvChartConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-2)' },
  }
  protected readonly rows = computed(() => [{ revenue: this.goal().revenue, fill: 'var(--color-revenue)' }])
  protected readonly percent = computed(() => Math.round((100 * this.goal().revenue) / this.goal().target))
  /** The bar fills the sweep, so the sweep is the share of the target: clockwise from 12 o'clock. */
  protected readonly endAngle = computed(() => 90 - 3.6 * Math.min(this.percent(), 100))
  protected readonly money = (value: number) => '$' + value.toLocaleString('en-US')
}

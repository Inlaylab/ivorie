import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'

/** Seats as a half ring: active members, pending invites, then the free seats. */
@Component({
  selector: 'app-dashboard-04-chart-seats',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header class="items-center pb-0">
        <iv-card-title>Seats</iv-card-title>
        <iv-card-description>{{ seats().total }} on the Team plan</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-1 items-center pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-[2/1] w-full max-w-[300px]">
          <!-- A half ring needs only the top half: the negative bottom margin drops the center to the bottom edge. -->
          <svg ivRadialChart [data]="rows()" [endAngle]="180" [innerRadius]="80" [outerRadius]="110" [margin]="{ bottom: -100 }">
            <g ivRadialBar dataKey="active" stackId="a" [cornerRadius]="5" fill="var(--color-active)" class="stroke-transparent stroke-2" />
            <g ivRadialBar dataKey="invited" stackId="a" [cornerRadius]="5" fill="var(--color-invited)" class="stroke-transparent stroke-2" />
            <g ivRadialBar dataKey="free" stackId="a" [cornerRadius]="5" fill="var(--color-free)" class="stroke-transparent stroke-2" />
            <g ivPolarRadiusAxis>
              <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                <svg:text [attr.x]="cx" [attr.y]="cy" text-anchor="middle">
                  <svg:tspan [attr.x]="cx" [attr.y]="cy - 16" class="fill-foreground text-2xl font-bold">{{ used() }}</svg:tspan>
                  <svg:tspan [attr.x]="cx" [attr.y]="cy + 4" class="fill-muted-foreground">Seats used</svg:tspan>
                </svg:text>
              </ng-template>
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel />
        </iv-chart>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2 text-sm">
        <div class="leading-none font-medium">{{ seats().total - used() }} seats free</div>
        <div class="text-muted-foreground leading-none">{{ seats().invited }} invites waiting for a reply</div>
      </iv-card-footer>
    </iv-card>
  `,
})
export class ChartSeats {
  readonly seats = input.required<{ active: number; invited: number; total: number }>()

  protected readonly config: IvChartConfig = {
    active: { label: 'Active', color: 'var(--chart-1)' },
    invited: { label: 'Invited', color: 'var(--chart-2)' },
    free: { label: 'Free', color: 'var(--muted)' },
  }
  protected readonly used = computed(() => this.seats().active + this.seats().invited)
  /** The stack fills the half ring, so the free seats close it as a muted last part. */
  protected readonly rows = computed(() => [{ ...this.seats(), free: this.seats().total - this.used() }])
}

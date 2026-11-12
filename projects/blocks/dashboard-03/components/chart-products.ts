import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { ProductRevenue } from '../data'

/** Top products by revenue, as horizontal bars with the name inside and the amount after. */
@Component({
  selector: 'app-dashboard-03-chart-products',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header>
        <iv-card-title>Top Products</iv-card-title>
        <iv-card-description>Revenue this month</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex-1">
        <iv-chart [config]="config" class="aspect-auto h-[280px] w-full">
          <svg ivBarChart [data]="data()" layout="vertical" [margin]="{ right: 56 }">
            <g ivCartesianGrid [horizontal]="false" />
            <g ivYAxis dataKey="product" type="category" hide />
            <g ivXAxis dataKey="revenue" type="number" hide />
            <g ivBar dataKey="revenue" [radius]="4">
              <g ivLabelList dataKey="product" position="insideLeft" [offset]="8" class="fill-(--color-label)" />
              <g ivLabelList dataKey="revenue" position="right" [offset]="8" class="fill-foreground" [formatter]="money" />
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" indicator="line" />
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export class ChartProducts {
  readonly data = input.required<ProductRevenue[]>()

  protected readonly config: IvChartConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-2)' },
    label: { color: 'var(--background)' },
  }
  protected readonly money = (value: unknown) => '$' + Number(value).toLocaleString('en-US')
}

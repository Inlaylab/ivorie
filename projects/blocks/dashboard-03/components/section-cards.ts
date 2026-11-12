import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingDown, lucideTrendingUp } from '@ng-icons/lucide'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'

/** Four stat cards for this month. Feed them from your API. */
@Component({
  selector: 'app-dashboard-03-section-cards',
  imports: [NgIcon, IvBadge, IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4' },
  template: `
    @for (s of stats; track s.label) {
      <iv-card class="@container/card">
        <iv-card-header>
          <iv-card-description>{{ s.label }}</iv-card-description>
          <iv-card-title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{{ s.value }}</iv-card-title>
          <iv-card-action>
            <iv-badge variant="outline"><ng-icon [svg]="s.up ? icons.up : icons.down" size="14" />{{ s.change }}</iv-badge>
          </iv-card-action>
        </iv-card-header>
        <iv-card-footer class="flex-col items-start gap-1.5 text-sm">
          <div class="line-clamp-1 flex gap-2 font-medium">{{ s.trend }} <ng-icon [svg]="s.up ? icons.up : icons.down" size="16" /></div>
          <div class="text-muted-foreground">{{ s.note }}</div>
        </iv-card-footer>
      </iv-card>
    }
  `,
})
export class SectionCards {
  protected readonly icons = { up: lucideTrendingUp, down: lucideTrendingDown }
  protected readonly stats = [
    { label: 'Revenue', value: '$45,231.89', change: '+20.1%', up: true, trend: 'Best month this year', note: 'Gross sales, all channels' },
    { label: 'Orders', value: '1,284', change: '+12.4%', up: true, trend: 'Up 142 on last month', note: 'Paid and fulfilled' },
    { label: 'Avg. Order Value', value: '$35.23', change: '+6.9%', up: true, trend: 'Bundles lift basket size', note: 'Revenue per order' },
    { label: 'Refund Rate', value: '1.8%', change: '-0.4%', up: false, trend: 'Fewer returns', note: 'Lower is better' },
  ]
}

import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingDown, lucideTrendingUp } from '@ng-icons/lucide'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'

/** Four stat cards. Feed them from your API. */
@Component({
  selector: 'app-dashboard-01-section-cards',
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
    { label: 'Total Revenue', value: '$1,250.00', change: '+12.5%', up: true, trend: 'Trending up this month', note: 'Visitors for the last 6 months' },
    { label: 'New Customers', value: '1,234', change: '-20%', up: false, trend: 'Down 20% this period', note: 'Acquisition needs attention' },
    { label: 'Active Accounts', value: '45,678', change: '+12.5%', up: true, trend: 'Strong user retention', note: 'Engagement exceed targets' },
    { label: 'Growth Rate', value: '4.5%', change: '+4.5%', up: true, trend: 'Steady performance increase', note: 'Meets growth projections' },
  ]
}

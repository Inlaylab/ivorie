import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingDown, lucideTrendingUp } from '@ng-icons/lucide'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'

/** Four usage stat cards for this month. Feed them from your API. */
@Component({
  selector: 'app-dashboard-04-section-cards',
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
    { label: 'Daily Active Users', value: '3,482', change: '+6.2%', up: true, trend: 'Up 6.2% on May', note: 'Average weekday' },
    { label: 'Weekly Active Users', value: '9,870', change: '+4.1%', up: true, trend: 'Steady weekly reach', note: 'DAU / WAU: 35%' },
    { label: 'Feature Adoption', value: '64%', change: '+3%', up: true, trend: 'Alerts drive the gain', note: 'Users on 3+ features' },
    { label: 'Churn', value: '2.1%', change: '-0.5%', up: false, trend: 'Fewer cancellations', note: 'Lower is better' },
  ]
}

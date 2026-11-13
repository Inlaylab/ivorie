import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideTrendingDown, lucideTrendingUp } from '@ng-icons/lucide'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'

/** Four KPI cards for the last 90 days. Feed them from your API. */
@Component({
  selector: 'app-dashboard-02-section-cards',
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
    { label: 'Visitors', value: '48,219', change: '+8.1%', up: true, trend: 'Up 8.1% on last quarter', note: 'Unique visitors, all properties' },
    { label: 'Page Views', value: '182,430', change: '+12.4%', up: true, trend: 'More pages per visit', note: '3.8 pages per session' },
    { label: 'Bounce Rate', value: '38.6%', change: '-2.3%', up: false, trend: 'Fewer one-page visits', note: 'Lower is better' },
    { label: 'Avg. Session', value: '3m 42s', change: '+0.8%', up: true, trend: 'Holding steady', note: 'Time on site per session' },
  ]
}

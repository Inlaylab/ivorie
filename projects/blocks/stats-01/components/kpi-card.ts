import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideShoppingCart, lucideTimer, lucideUsers, lucideWallet } from '@ng-icons/lucide'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IvDelta } from '@inlaylab/ivorie/delta'
import { IvSparkline } from '@inlaylab/ivorie/sparkline'
import { IV_STAT_IMPORTS } from '@inlaylab/ivorie/stat'
import type { Kpi } from '../data'

const ICONS = { revenue: lucideWallet, users: lucideUsers, orders: lucideShoppingCart, latency: lucideTimer }

/** One KPI in a card: icon, label, value with its change, a sparkline and a note. */
@Component({
  selector: 'app-stats-01-kpi-card',
  imports: [NgIcon, IV_CARD_IMPORTS, IV_STAT_IMPORTS, IvDelta, IvSparkline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="h-full">
      <iv-card-content>
        <iv-stat>
          <iv-stat-header>
            <iv-stat-icon><ng-icon [svg]="icon()" /></iv-stat-icon>
            <iv-stat-label>{{ kpi().label }}</iv-stat-label>
          </iv-stat-header>
          <iv-stat-value>{{ kpi().value }} <iv-delta [value]="kpi().delta" [invert]="kpi().invert ?? false" /></iv-stat-value>
          <div class="flex items-end justify-between gap-3">
            <iv-stat-description>{{ kpi().note }}</iv-stat-description>
            <svg ivSparkline [data]="kpi().trend" type="area"></svg>
          </div>
        </iv-stat>
      </iv-card-content>
    </iv-card>
  `,
})
export class KpiCard {
  readonly kpi = input.required<Kpi>()
  protected readonly icon = computed(() => ICONS[this.kpi().icon])
}

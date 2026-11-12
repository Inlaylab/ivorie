import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { Sale } from '../data'

/** The latest orders: who bought and how much. */
@Component({
  selector: 'app-dashboard-03-recent-sales',
  imports: [IV_AVATAR_IMPORTS, IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="h-full">
      <iv-card-header>
        <iv-card-title>Recent Sales</iv-card-title>
        <iv-card-description>1,284 orders this month.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <ul class="grid gap-6">
          @for (sale of sales(); track sale.email) {
            <li class="flex items-center gap-4">
              <iv-avatar class="size-9"><iv-avatar-fallback>{{ sale.initials }}</iv-avatar-fallback></iv-avatar>
              <div class="grid min-w-0 gap-1">
                <p class="truncate text-sm leading-none font-medium">{{ sale.name }}</p>
                <p class="text-muted-foreground truncate text-sm">{{ sale.email }}</p>
              </div>
              <div class="ml-auto font-medium tabular-nums">+{{ money(sale.amount) }}</div>
            </li>
          }
        </ul>
      </iv-card-content>
    </iv-card>
  `,
})
export class RecentSales {
  readonly sales = input.required<Sale[]>()
  protected readonly money = (value: number) => '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

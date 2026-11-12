import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IvSeparator } from '@inlaylab/ivorie/separator'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { AppSidebar } from './components/app-sidebar'
import { ChartActiveUsers } from './components/chart-active-users'
import { ChartFeatures } from './components/chart-features'
import { ChartSeatChange } from './components/chart-seat-change'
import { ChartSeats } from './components/chart-seats'
import { SectionCards } from './components/section-cards'
import { activeUsers, featureUsage, seatChanges, seats } from './data'

export const meta = {
  title: 'Dashboard 04',
  description: 'A product usage dashboard with a floating sidebar, a line chart, a radar, a seat ring and a gain/loss bar chart.',
}

/** The product usage page. */
@Component({
  selector: 'app-dashboard-04',
  imports: [IvSeparator, IV_SIDEBAR_IMPORTS, AppSidebar, ChartActiveUsers, ChartFeatures, ChartSeatChange, ChartSeats, SectionCards],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-provider style="--sidebar-width: 17rem">
      <app-dashboard-04-sidebar />
      <main ivSidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 px-4 lg:px-6">
          <iv-sidebar-trigger class="-ml-1" />
          <iv-separator orientation="vertical" class="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <h1 class="text-base font-medium">Product Usage</h1>
        </header>
        <div class="@container/main flex flex-1 flex-col gap-4 pb-4 md:gap-6 md:pb-6">
          <app-dashboard-04-section-cards />
          <app-dashboard-04-chart-active-users class="px-4 lg:px-6" [data]="activeUsers" />
          <div class="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
            <app-dashboard-04-chart-features [data]="featureUsage" />
            <app-dashboard-04-chart-seats [seats]="seats" />
            <app-dashboard-04-chart-seat-change class="@3xl/main:col-span-2 @6xl/main:col-span-1" [data]="seatChanges" />
          </div>
        </div>
      </main>
    </iv-sidebar-provider>
  `,
})
export class Dashboard04 {
  protected readonly activeUsers = activeUsers
  protected readonly featureUsage = featureUsage
  protected readonly seats = seats
  protected readonly seatChanges = seatChanges
}

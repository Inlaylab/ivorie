import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IV_BREADCRUMB_IMPORTS } from '@inlaylab/ivorie/breadcrumb'
import { IvSeparator } from '@inlaylab/ivorie/separator'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { AppSidebar } from './components/app-sidebar'
import { ChartChannels } from './components/chart-channels'
import { ChartGoal } from './components/chart-goal'
import { ChartProducts } from './components/chart-products'
import { RecentSales } from './components/recent-sales'
import { SectionCards } from './components/section-cards'
import { goal, recentSales, revenueByChannel, topProducts } from './data'

export const meta = {
  title: 'Dashboard 03',
  description: 'A sales dashboard with stat cards, a donut with the total, a target ring, top products and recent sales.',
}

/** The sales page. */
@Component({
  selector: 'app-dashboard-03',
  imports: [IV_BREADCRUMB_IMPORTS, IvSeparator, IV_SIDEBAR_IMPORTS, AppSidebar, ChartChannels, ChartGoal, ChartProducts, RecentSales, SectionCards],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-provider>
      <app-dashboard-03-sidebar />
      <main ivSidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-6">
          <iv-sidebar-trigger class="-ml-1" />
          <iv-separator orientation="vertical" class="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <h1 class="sr-only">Sales overview</h1>
          <nav ivBreadcrumb>
            <ol ivBreadcrumbList>
              <li ivBreadcrumbItem class="hidden md:block"><a ivBreadcrumbLink href="#">Sales</a></li>
              <li ivBreadcrumbSeparator class="hidden md:block"></li>
              <li ivBreadcrumbItem><span ivBreadcrumbPage>Overview</span></li>
            </ol>
          </nav>
        </header>
        <div class="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <app-dashboard-03-section-cards />
          <div class="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2">
            <app-dashboard-03-chart-channels [data]="revenueByChannel" />
            <app-dashboard-03-chart-goal [goal]="goal" />
          </div>
          <div class="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-7">
            <app-dashboard-03-chart-products class="@5xl/main:col-span-4" [data]="topProducts" />
            <app-dashboard-03-recent-sales class="@5xl/main:col-span-3" [sales]="recentSales" />
          </div>
        </div>
      </main>
    </iv-sidebar-provider>
  `,
})
export class Dashboard03 {
  protected readonly revenueByChannel = revenueByChannel
  protected readonly goal = goal
  protected readonly topProducts = topProducts
  protected readonly recentSales = recentSales
}

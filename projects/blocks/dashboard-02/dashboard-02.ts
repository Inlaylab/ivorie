import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IvSeparator } from '@inlaylab/ivorie/separator'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { AppSidebar } from './components/app-sidebar'
import { ChartConversions } from './components/chart-conversions'
import { ChartDevices } from './components/chart-devices'
import { ChartTraffic } from './components/chart-traffic'
import { SectionCards } from './components/section-cards'
import { conversions, devices, sessions } from './data'

export const meta = {
  title: 'Dashboard 02',
  description: 'An analytics dashboard with KPI cards, an interactive area chart, a stacked bar chart and a line chart.',
}

/** The analytics page. */
@Component({
  selector: 'app-dashboard-02',
  imports: [IvSeparator, IV_SIDEBAR_IMPORTS, AppSidebar, ChartConversions, ChartDevices, ChartTraffic, SectionCards],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-provider style="--header-height: calc(var(--spacing) * 12)">
      <app-dashboard-02-sidebar />
      <main ivSidebarInset>
        <header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
          <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <iv-sidebar-trigger class="-ml-1" />
            <iv-separator orientation="vertical" class="mx-2 data-vertical:h-4 data-vertical:self-auto" />
            <h1 class="text-base font-medium">Analytics</h1>
            <span class="text-muted-foreground ml-auto hidden text-sm sm:block">Apr 2 – Jun 30, 2024</span>
          </div>
        </header>
        <div class="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <app-dashboard-02-section-cards />
          <app-dashboard-02-chart-traffic class="px-4 lg:px-6" [data]="sessions" />
          <div class="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2">
            <app-dashboard-02-chart-devices [data]="devices" />
            <app-dashboard-02-chart-conversions [data]="conversions" />
          </div>
        </div>
      </main>
    </iv-sidebar-provider>
  `,
})
export class Dashboard02 {
  protected readonly sessions = sessions
  protected readonly devices = devices
  protected readonly conversions = conversions
}

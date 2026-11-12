import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IvSeparator } from '@inlaylab/ivorie/separator'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { AppSidebar } from './components/app-sidebar'
import { ChartAreaInteractive } from './components/chart-area-interactive'
import { Documents } from './components/documents'
import { SectionCards } from './components/section-cards'
import { documents, visitors } from './data'

export const meta = {
  title: 'Dashboard 01',
  description: 'A dashboard with an inset sidebar, stat cards, an interactive area chart and a data table.',
}

/** The dashboard page. */
@Component({
  selector: 'app-dashboard-01',
  imports: [IvSeparator, IV_SIDEBAR_IMPORTS, AppSidebar, ChartAreaInteractive, Documents, SectionCards],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-provider style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12)">
      <app-dashboard-01-sidebar />
      <main ivSidebarInset>
        <header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <iv-sidebar-trigger class="-ml-1" />
            <iv-separator orientation="vertical" class="mx-2 data-vertical:h-4 data-vertical:self-auto" />
            <h1 class="text-base font-medium">Documents</h1>
          </div>
        </header>
        <div class="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <app-dashboard-01-section-cards />
          <app-dashboard-01-chart-area-interactive class="px-4 lg:px-6" [data]="visitors" />
          <app-dashboard-01-documents [data]="documents" />
        </div>
      </main>
    </iv-sidebar-provider>
  `,
})
export class Dashboard01 {
  protected readonly documents = documents
  protected readonly visitors = visitors
}

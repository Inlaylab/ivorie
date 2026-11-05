import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IvSeparator } from '@inlaylab/ivorie/separator'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { IvSkeleton } from '@inlaylab/ivorie/skeleton'
import { AppSidebar } from './components/app-sidebar'
import { Documents } from './components/documents'
import { SectionCards } from './components/section-cards'
import { documents } from './data'

export const meta = {
  title: 'Dashboard 01',
  description: 'A dashboard with an inset sidebar, stat cards, a chart slot and a data table.',
}

/** The dashboard page. */
@Component({
  selector: 'app-dashboard-01',
  imports: [IvSeparator, IV_SIDEBAR_IMPORTS, IvSkeleton, AppSidebar, Documents, SectionCards],
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
          <!-- chart: 1.6. Charts ship in Ivorie 1.6; put your chart here until then. -->
          <div class="px-4 lg:px-6" data-testid="chart-slot">
            <iv-skeleton class="h-64 w-full rounded-xl" />
          </div>
          <app-dashboard-01-documents [data]="documents" />
        </div>
      </main>
    </iv-sidebar-provider>
  `,
})
export class Dashboard01 {
  protected readonly documents = documents
}

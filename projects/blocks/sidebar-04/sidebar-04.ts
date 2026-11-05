import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IV_BREADCRUMB_IMPORTS } from '@inlaylab/ivorie/breadcrumb'
import { IvSeparator } from '@inlaylab/ivorie/separator'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'
import { AppSidebar } from './components/app-sidebar'

export const meta = {
  title: 'Sidebar 04',
  description: 'A floating sidebar with submenus.',
}

/** The app shell: the sidebar, then the page with a header and your content. */
@Component({
  selector: 'app-sidebar-04',
  imports: [IV_BREADCRUMB_IMPORTS, IvSeparator, IV_SIDEBAR_IMPORTS, AppSidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-sidebar-provider style="--sidebar-width: 19rem">
      <app-sidebar-04-sidebar />
      <main ivSidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <iv-sidebar-trigger class="-ml-1" />
          <iv-separator orientation="vertical" class="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <nav ivBreadcrumb>
            <ol ivBreadcrumbList>
              <li ivBreadcrumbItem class="hidden md:block"><a ivBreadcrumbLink href="#">Build Your Application</a></li>
              <li ivBreadcrumbSeparator class="hidden md:block"></li>
              <li ivBreadcrumbItem><span ivBreadcrumbPage>Data Fetching</span></li>
            </ol>
          </nav>
        </header>
        <div class="flex flex-1 flex-col gap-4 p-4">
          <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="bg-muted/50 aspect-video rounded-xl"></div>
            <div class="bg-muted/50 aspect-video rounded-xl"></div>
            <div class="bg-muted/50 aspect-video rounded-xl"></div>
          </div>
          <div class="bg-muted/50 min-h-[60vh] flex-1 rounded-xl md:min-h-min"></div>
        </div>
      </main>
    </iv-sidebar-provider>
  `,
})
export class Sidebar04 {}

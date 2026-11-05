import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideSearch } from '@ng-icons/lucide'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar'

/** A search box for the sidebar. Wire `(submit)` to your search. */
@Component({
  selector: 'app-sidebar-01-search-form',
  imports: [NgIcon, IV_INPUT_IMPORTS, IV_SIDEBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form role="search" (submit)="$event.preventDefault()">
      <iv-sidebar-group class="py-0">
        <iv-sidebar-group-content class="relative">
          <label ivLabel for="sidebar-01-search" class="sr-only">Search</label>
          <input ivInput id="sidebar-01-search" type="search" placeholder="Search the docs..." class="bg-background h-8 pl-8 shadow-none" />
          <ng-icon [svg]="search" size="16" class="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 opacity-50 select-none" />
        </iv-sidebar-group-content>
      </iv-sidebar-group>
    </form>
  `,
})
export class SearchForm {
  protected readonly search = lucideSearch
}

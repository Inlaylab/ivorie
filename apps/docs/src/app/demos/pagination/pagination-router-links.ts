import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IV_PAGINATION_IMPORTS } from '@ivorie/ui/pagination';

@Component({
  selector: 'demo-pagination-router-links',
  imports: [RouterLink, IV_PAGINATION_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav ivPagination>
      <ul ivPaginationContent>
        @for (p of pages; track p) {
          <li ivPaginationItem>
            <a ivPaginationLink routerLink="/docs/pagination" [queryParams]="{ page: p }" [isActive]="p === 1">
              {{ p }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export default class PaginationRouterLinksDemo {
  protected readonly pages = [1, 2, 3];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_PAGINATION_IMPORTS } from '@inlaylab/ivorie/pagination';

@Component({
  selector: 'demo-pagination-custom-labels',
  imports: [IV_PAGINATION_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav ivPagination>
      <ul ivPaginationContent>
        <li ivPaginationItem><a ivPaginationPrevious href="#" text="Prev" (click)="$event.preventDefault()"></a></li>
        <li ivPaginationItem>
          <a ivPaginationLink href="#" [isActive]="true" (click)="$event.preventDefault()">1</a>
        </li>
        <li ivPaginationItem><a ivPaginationNext href="#" text="More" (click)="$event.preventDefault()"></a></li>
      </ul>
    </nav>
  `,
})
export default class PaginationCustomLabelsDemo {}

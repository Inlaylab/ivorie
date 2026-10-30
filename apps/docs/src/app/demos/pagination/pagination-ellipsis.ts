import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IV_PAGINATION_IMPORTS } from '@ivorie/ui/pagination';

@Component({
  selector: 'demo-pagination-ellipsis',
  imports: [IV_PAGINATION_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav ivPagination>
      <ul ivPaginationContent>
        <li ivPaginationItem><a ivPaginationPrevious href="#" (click)="go(page() - 1, $event)"></a></li>
        <li ivPaginationItem>
          <a ivPaginationLink href="#" [isActive]="page() === 1" (click)="go(1, $event)">1</a>
        </li>
        @if (page() > 3) {
          <li ivPaginationItem><span ivPaginationEllipsis></span></li>
        }
        @for (p of visible(); track p) {
          <li ivPaginationItem>
            <a ivPaginationLink href="#" [isActive]="p === page()" (click)="go(p, $event)">{{ p }}</a>
          </li>
        }
        @if (page() < total - 2) {
          <li ivPaginationItem><span ivPaginationEllipsis></span></li>
        }
        <li ivPaginationItem>
          <a ivPaginationLink href="#" [isActive]="page() === total" (click)="go(total, $event)">{{ total }}</a>
        </li>
        <li ivPaginationItem><a ivPaginationNext href="#" (click)="go(page() + 1, $event)"></a></li>
      </ul>
    </nav>
  `,
})
export default class PaginationEllipsisDemo {
  protected readonly total = 20;
  protected readonly page = signal(10);
  // The current page and its neighbors, without the first and last page.
  protected readonly visible = computed(() =>
    [this.page() - 1, this.page(), this.page() + 1].filter((p) => p > 1 && p < this.total),
  );

  protected go(next: number, event: Event) {
    event.preventDefault();
    this.page.set(Math.min(Math.max(next, 1), this.total));
  }
}

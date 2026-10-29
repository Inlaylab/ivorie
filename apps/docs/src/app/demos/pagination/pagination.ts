import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_PAGINATION_IMPORTS } from '@ivorie/ui/pagination';

@Component({
  selector: 'demo-pagination',
  imports: [IV_PAGINATION_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav ivPagination>
      <ul ivPaginationContent>
        <li ivPaginationItem><a ivPaginationPrevious href="#" (click)="go(page() - 1, $event)"></a></li>
        @for (p of pages; track p) {
          <li ivPaginationItem>
            <a ivPaginationLink href="#" [isActive]="p === page()" (click)="go(p, $event)">{{ p }}</a>
          </li>
        }
        <li ivPaginationItem><a ivPaginationNext href="#" (click)="go(page() + 1, $event)"></a></li>
      </ul>
    </nav>
  `,
})
export default class PaginationDemo {
  protected readonly pages = [1, 2, 3, 4, 5];
  protected readonly page = signal(2);

  protected go(next: number, event: Event) {
    event.preventDefault();
    this.page.set(Math.min(Math.max(next, 1), this.pages.length));
  }
}

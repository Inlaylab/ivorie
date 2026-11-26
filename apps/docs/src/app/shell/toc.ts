import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { TocItem } from '../content/types';

@Component({
  selector: 'docs-toc',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <nav [attr.aria-labelledby]="titled() ? 'toc-title' : null" [attr.aria-label]="titled() ? null : 'On this page'" class="text-[0.8125rem]">
        @if (titled()) {
          <p id="toc-title" class="text-muted-foreground mb-2 text-xs font-medium">On this page</p>
        }
        <ul class="flex flex-col border-l">
          @for (item of items(); track item.id) {
            <li>
              <a
                [routerLink]="[]"
                [fragment]="item.id"
                class="text-muted-foreground hover:text-foreground hover:border-foreground -ml-px block truncate border-l border-transparent py-1 pl-3 transition-colors"
                [class.pl-6]="item.level === 3"
                [attr.title]="item.text"
                >{{ item.text }}</a
              >
            </li>
          }
        </ul>
      </nav>
    }
  `,
})
export class Toc {
  readonly items = input.required<TocItem[]>();
  /** False where a wrapper already names the list (the folded copy on small screens): one id per page. */
  readonly titled = input(true);
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { TocItem } from '../content/types';

@Component({
  selector: 'docs-toc',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <nav aria-labelledby="toc-title" class="text-[0.8125rem]">
        <p id="toc-title" class="text-muted-foreground mb-2 text-xs font-medium">On this page</p>
        <ul class="flex flex-col">
          @for (item of items(); track item.id) {
            <li>
              <a
                [routerLink]="[]"
                [fragment]="item.id"
                class="text-muted-foreground hover:text-foreground block truncate py-1 transition-colors"
                [class.pl-3]="item.level === 3"
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
}

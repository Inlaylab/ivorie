import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

export interface IvBarListItem {
  name: string
  value: number
  /** Makes the row a link. */
  href?: string
}

/**
 * Ranked rows: each name sits on a bar as long as its share of the largest value, its number at the end.
 * For top pages, countries, referrers. Sorted largest first unless `sort="none"`.
 */
@Component({
  selector: 'iv-bar-list',
  host: { 'data-slot': 'bar-list', role: 'list', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (row of rows(); track $index) {
      <div data-slot="bar-list-row" role="listitem" class="cn-bar-list-row flex items-center gap-4">
        <div class="relative min-w-0 flex-1">
          <div data-slot="bar-list-bar" aria-hidden="true" class="cn-bar-list-bar absolute inset-y-0 left-0 transition-[width]" [style.width.%]="row.width"></div>
          @if (row.href) {
            <a data-slot="bar-list-label" [href]="row.href" class="cn-bar-list-label relative flex h-8 items-center truncate px-2.5 text-sm underline-offset-4 outline-none hover:underline focus-visible:underline">{{ row.name }}</a>
          } @else {
            <span data-slot="bar-list-label" class="cn-bar-list-label relative flex h-8 items-center truncate px-2.5 text-sm">{{ row.name }}</span>
          }
        </div>
        <span data-slot="bar-list-value" class="cn-bar-list-value text-muted-foreground shrink-0 text-sm tabular-nums">{{ format()(row.value) }}</span>
      </div>
    }
  `,
})
export class IvBarList {
  private readonly locale = inject(LOCALE_ID)
  readonly data = input<IvBarListItem[]>([])
  /** Order of the rows. */
  readonly sort = input<'descending' | 'ascending' | 'none'>('descending')
  /** How each number reads. */
  readonly format = input<(value: number) => string>((v) => v.toLocaleString(this.locale))
  readonly class = input('')

  protected readonly rows = computed(() => {
    const rows = [...this.data()]
    if (this.sort() !== 'none') rows.sort((a, b) => (this.sort() === 'descending' ? b.value - a.value : a.value - b.value))
    const top = Math.max(0, ...rows.map((r) => r.value))
    // A tiny value still shows a sliver of bar.
    return rows.map((r) => ({ ...r, width: top > 0 ? Math.max(2, (r.value / top) * 100) : 0 }))
  })

  protected readonly classes = computed(() => cn('cn-bar-list flex w-full flex-col gap-1.5', this.class()))
}

import { ChangeDetectionStrategy, Component, Directive, computed, inject, input } from '@angular/core'
import { IvButton } from '@inlaylab/ivorie/button'
import { IvCheckbox } from '@inlaylab/ivorie/checkbox'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu'
import { IvIcon } from '@inlaylab/ivorie/icon'
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select'
import { IvSkeleton } from '@inlaylab/ivorie/skeleton'
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table'
import type { IvColumnVisibility, IvPagination, IvRowSelection, IvSort } from './data-table.state'

// Each part takes only the feature it needs, so a table can use one feature or all of them.

/**
 * A sortable header cell. Use it instead of `th[ivTableHead]` (both set the cell's classes).
 * `<th ivDataTableSort="email" [sort]="sort">Email</th>`
 */
@Component({
  selector: 'th[ivDataTableSort]',
  imports: [IvButton, IvIcon],
  host: {
    'data-slot': 'data-table-sort',
    '[class]': 'classes()',
    '[attr.aria-sort]': 'ariaSort()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="ghost" size="sm" type="button" class="-ml-2.5" (click)="sort().toggleSort(column())">
      <ng-content />
      <svg [ivIcon]="icon()" aria-hidden="true"></svg>
    </button>
  `,
})
export class IvDataTableSort {
  /** The column id. */
  readonly column = input.required<string>({ alias: 'ivDataTableSort' })
  readonly sort = input.required<IvSort<any>>()
  readonly class = input('')

  protected readonly classes = computed(() => cn('cn-table-head cn-data-table-sort', this.class()))
  private readonly direction = computed(() => this.sort().direction(this.column()))
  protected readonly ariaSort = computed(() =>
    this.direction() === 'asc' ? 'ascending' : this.direction() === 'desc' ? 'descending' : 'none',
  )
  protected readonly icon = computed(() =>
    this.direction() === 'asc' ? 'chevron-up' : this.direction() === 'desc' ? 'chevron-down' : 'chevrons-up-down',
  )
}

/** Marks a selected row with `data-state="selected"`. Sets no class, so it sits next to `ivTableRow`. */
@Directive({
  selector: 'tr[ivDataTableRow]',
  host: { '[attr.data-state]': 'selection().isSelected(rowId()) ? "selected" : null' },
})
export class IvDataTableRow {
  readonly rowId = input.required<string>({ alias: 'ivDataTableRow' })
  readonly selection = input.required<IvRowSelection<any>>()
}

/** A checkbox for every row the selection was given (the page): checked, mixed or empty. */
@Component({
  selector: 'iv-data-table-select-all',
  imports: [IvCheckbox],
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-checkbox
      class="translate-y-0.5"
      aria-label="Select all rows on this page"
      [checked]="selection().allSelected()"
      [indeterminate]="selection().someSelected()"
      [disabled]="!selection().hasRows()"
      (checkedChange)="selection().toggleAll()"
    />
  `,
})
export class IvDataTableSelectAll {
  readonly selection = input.required<IvRowSelection<any>>()
}

/** The checkbox for one row. */
@Component({
  selector: 'iv-data-table-row-select',
  imports: [IvCheckbox],
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-checkbox
      class="translate-y-0.5"
      [aria-label]="ariaLabel()"
      [checked]="selection().isSelected(rowId())"
      (checkedChange)="selection().toggle(rowId())"
    />
  `,
})
export class IvDataTableRowSelect {
  readonly selection = input.required<IvRowSelection<any>>()
  readonly rowId = input.required<string>()
  readonly ariaLabel = input('Select row', { alias: 'aria-label' })
}

/**
 * The table body: skeleton rows while loading, one row spanning `colspan` columns when there are
 * no rows, else your rows. Put custom empty content in an element with `ivDataTableEmpty`.
 */
@Component({
  selector: 'tbody[ivDataTableBody]',
  imports: [IvSkeleton],
  host: {
    'data-slot': 'data-table-body',
    '[class]': 'classes()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      @for (r of skeletonRows(); track $index) {
        <tr data-slot="table-row" class="cn-table-row">
          @for (c of cells(); track $index) {
            <td data-slot="table-cell" class="cn-table-cell"><iv-skeleton class="h-4 w-full" /></td>
          }
        </tr>
      }
    } @else if (!rows().length) {
      <tr data-slot="table-row" class="cn-table-row cn-data-table-empty">
        <td data-slot="table-cell" class="cn-table-cell text-muted-foreground h-24 text-center" [attr.colspan]="colspan()">
          <ng-content select="[ivDataTableEmpty]">No results.</ng-content>
        </td>
      </tr>
    } @else {
      <ng-content />
    }
  `,
})
export class IvDataTableBody {
  readonly rows = input.required<readonly unknown[]>()
  /** How many columns the empty and loading rows span: the visible ones. */
  readonly colspan = input.required<number>()
  readonly loading = input(false)
  readonly loadingRows = input(10)
  readonly class = input('')

  protected readonly classes = computed(() => cn('cn-table-body', this.class()))
  protected readonly skeletonRows = computed(() => Array.from({ length: this.loadingRows() }))
  protected readonly cells = computed(() => Array.from({ length: this.colspan() }))
}

/** Page size, "Page X of Y" and first, previous, next and last. With `[selection]`, also "N row(s) selected.". */
@Component({
  selector: 'iv-data-table-pagination',
  imports: [IvButton, IvIcon, IV_SELECT_IMPORTS],
  host: {
    'data-slot': 'data-table-pagination',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-muted-foreground flex-1 text-sm">
      @if (selection(); as s) {
        <!-- No total: selected rows can be filtered out of view and still count. -->
        {{ s.selected().size }} row(s) selected.
      }
    </div>
    <div class="flex items-center gap-6 lg:gap-8">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium" [id]="labelId">Rows per page</span>
        <iv-select size="sm" [value]="'' + pagination().pagination().pageSize" (valueChange)="setPageSize($event)">
          <iv-select-trigger class="w-20" [aria-labelledby]="labelId" />
          <iv-select-content>
            @for (size of pageSizes(); track size) {
              <iv-select-item [value]="'' + size">{{ size }}</iv-select-item>
            }
          </iv-select-content>
        </iv-select>
      </div>
      <span class="w-24 text-center text-sm font-medium" data-slot="data-table-page" aria-live="polite">
        Page {{ pagination().page() + 1 }} of {{ pagination().pageCount() }}
      </span>
      <div class="flex items-center gap-2">
        <button ivButton variant="outline" size="icon-sm" type="button" class="hidden lg:inline-flex" aria-label="Go to first page" [disabled]="!pagination().canPrevious()" (click)="pagination().setPage(0)">
          <svg ivIcon="chevrons-left" aria-hidden="true"></svg>
        </button>
        <button ivButton variant="outline" size="icon-sm" type="button" aria-label="Go to previous page" [disabled]="!pagination().canPrevious()" (click)="pagination().setPage(pagination().page() - 1)">
          <svg ivIcon="chevron-left" aria-hidden="true"></svg>
        </button>
        <button ivButton variant="outline" size="icon-sm" type="button" aria-label="Go to next page" [disabled]="!pagination().canNext()" (click)="pagination().setPage(pagination().page() + 1)">
          <svg ivIcon="chevron-right" aria-hidden="true"></svg>
        </button>
        <button ivButton variant="outline" size="icon-sm" type="button" class="hidden lg:inline-flex" aria-label="Go to last page" [disabled]="!pagination().canNext()" (click)="pagination().setPage(pagination().pageCount() - 1)">
          <svg ivIcon="chevrons-right" aria-hidden="true"></svg>
        </button>
      </div>
    </div>
  `,
})
export class IvDataTablePagination {
  readonly pagination = input.required<IvPagination<any>>()
  readonly selection = input<IvRowSelection<any> | null>(null)
  readonly pageSizes = input<number[]>([10, 20, 30, 50])
  readonly class = input('')

  protected readonly labelId = inject(IvIdGenerator).next('iv-data-table-page-size')
  protected readonly classes = computed(() =>
    cn('cn-data-table-pagination flex flex-wrap items-center justify-between gap-4 px-2', this.class()),
  )

  protected setPageSize(value: string | null): void {
    const size = Number(value)
    if (size > 0) this.pagination().setPageSize(size)
  }
}

/** A "View" menu with a checkbox for each hideable column. */
@Component({
  selector: 'iv-data-table-view-options',
  imports: [IvButton, IV_DROPDOWN_MENU_IMPORTS],
  host: { 'data-slot': 'data-table-view-options', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dropdown-menu>
      <button ivButton ivDropdownMenuTrigger variant="outline" size="sm" type="button">View</button>
      <iv-dropdown-menu-content align="end" class="w-40">
        <iv-dropdown-menu-label>Toggle columns</iv-dropdown-menu-label>
        <iv-dropdown-menu-separator />
        @for (c of visibility().hideable; track c.id) {
          <iv-dropdown-menu-checkbox-item
            [checked]="visibility().isVisible(c.id)"
            (checkedChange)="visibility().setVisible(c.id, $event)"
          >
            {{ c.header }}
          </iv-dropdown-menu-checkbox-item>
        }
      </iv-dropdown-menu-content>
    </iv-dropdown-menu>
  `,
})
export class IvDataTableViewOptions {
  readonly visibility = input.required<IvColumnVisibility<any>>()
  readonly class = input('')

  protected readonly classes = computed(() => cn('cn-data-table-view-options inline-flex', this.class()))
}

/** Every data-table part, plus the table parts, in one import. */
export const IV_DATA_TABLE_IMPORTS = [
  ...IV_TABLE_IMPORTS,
  IvDataTableSort,
  IvDataTableRow,
  IvDataTableSelectAll,
  IvDataTableRowSelect,
  IvDataTableBody,
  IvDataTablePagination,
  IvDataTableViewOptions,
] as const

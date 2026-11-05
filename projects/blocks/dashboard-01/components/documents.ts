import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IV_DATA_TABLE_IMPORTS, IvColumnDef, ivDataTable } from '@inlaylab/ivorie/data-table'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'
import { Document } from '../data'

const COLUMNS: IvColumnDef<Document>[] = [
  { id: 'header', header: 'Header', accessor: (d) => d.header, sortable: true },
  { id: 'type', header: 'Section Type', accessor: (d) => d.type, hideable: true },
  { id: 'status', header: 'Status', accessor: (d) => d.status, hideable: true },
  { id: 'target', header: 'Target', accessor: (d) => d.target, sortable: true, hideable: true },
  { id: 'limit', header: 'Limit', accessor: (d) => d.limit, sortable: true, hideable: true },
  { id: 'reviewer', header: 'Reviewer', accessor: (d) => d.reviewer, hideable: true },
]

/** The documents table: filter, sort, select, hide columns and page, in the browser. */
@Component({
  selector: 'app-dashboard-01-documents',
  imports: [IvBadge, IV_DATA_TABLE_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-4 px-4 lg:px-6' },
  template: `
    <div class="flex items-center gap-2">
      <label ivLabel for="dashboard-01-filter" class="sr-only">Filter documents</label>
      <input
        ivInput
        id="dashboard-01-filter"
        class="max-w-sm"
        placeholder="Filter documents…"
        (input)="table.filter.setFilter($any($event.target).value)"
      />
      <iv-data-table-view-options class="ml-auto" [visibility]="table.visibility" />
    </div>
    <iv-table class="rounded-lg border">
      <thead ivTableHeader class="bg-muted sticky top-0 z-10">
        <tr ivTableRow>
          <th ivTableHead class="w-10"><iv-data-table-select-all [selection]="table.selection" /></th>
          <th ivDataTableSort="header" [sort]="table.sort">Header</th>
          @if (show('type')) {
            <th ivTableHead>Section Type</th>
          }
          @if (show('status')) {
            <th ivTableHead>Status</th>
          }
          @if (show('target')) {
            <th ivDataTableSort="target" [sort]="table.sort" class="text-right">Target</th>
          }
          @if (show('limit')) {
            <th ivDataTableSort="limit" [sort]="table.sort" class="text-right">Limit</th>
          }
          @if (show('reviewer')) {
            <th ivTableHead>Reviewer</th>
          }
        </tr>
      </thead>
      <tbody ivDataTableBody [rows]="table.rows()" [colspan]="table.visibility.columns().length + 1">
        @for (d of table.rows(); track d.id) {
          <tr ivTableRow [ivDataTableRow]="d.id" [selection]="table.selection">
            <td ivTableCell>
              <iv-data-table-row-select [selection]="table.selection" [rowId]="d.id" [aria-label]="'Select ' + d.header" />
            </td>
            <td ivTableCell class="font-medium">{{ d.header }}</td>
            @if (show('type')) {
              <td ivTableCell><iv-badge variant="outline" class="text-muted-foreground px-1.5">{{ d.type }}</iv-badge></td>
            }
            @if (show('status')) {
              <td ivTableCell><iv-badge [variant]="d.status === 'Done' ? 'secondary' : 'outline'" class="px-1.5">{{ d.status }}</iv-badge></td>
            }
            @if (show('target')) {
              <td ivTableCell class="text-right tabular-nums">{{ d.target }}</td>
            }
            @if (show('limit')) {
              <td ivTableCell class="text-right tabular-nums">{{ d.limit }}</td>
            }
            @if (show('reviewer')) {
              <td ivTableCell>{{ d.reviewer }}</td>
            }
          </tr>
        }
      </tbody>
    </iv-table>
    <iv-data-table-pagination [pagination]="table.pagination" [selection]="table.selection" />
  `,
})
export class Documents {
  readonly data = input.required<Document[]>()
  protected readonly table = ivDataTable({ data: this.data, columns: COLUMNS, getRowId: (d) => d.id })

  protected show(id: string): boolean {
    return this.table.visibility.isVisible(id)
  }
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IV_DATA_TABLE_IMPORTS, IvColumnDef, ivDataTable } from '@inlaylab/ivorie/data-table';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';

interface Payment {
  id: string;
  email: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

const NAMES = [
  'ada',
  'alan',
  'grace',
  'katherine',
  'linus',
  'margaret',
  'dennis',
  'barbara',
  'ken',
  'radia',
];
const STATUSES = ['paid', 'pending', 'paid', 'failed', 'paid'] as const;
const PAYMENTS: Payment[] = Array.from({ length: 25 }, (_, i) => ({
  id: `pay_${i + 1}`,
  email: `${NAMES[i % NAMES.length]}${i >= NAMES.length ? i : ''}@example.com`,
  amount: 40 + ((i * 137) % 900),
  status: STATUSES[i % STATUSES.length],
}));

const COLUMNS: IvColumnDef<Payment>[] = [
  { id: 'status', header: 'Status', accessor: (p) => p.status, hideable: true },
  { id: 'email', header: 'Email', accessor: (p) => p.email, sortable: true, hideable: true },
  { id: 'amount', header: 'Amount', accessor: (p) => p.amount, sortable: true, hideable: true },
];

@Component({
  selector: 'demo-data-table',
  imports: [IV_DATA_TABLE_IMPORTS, IV_INPUT_IMPORTS, IvBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-full max-w-3xl flex-col gap-4">
      <div class="flex items-center gap-2">
        <label ivLabel for="payments-filter" class="sr-only">Filter emails</label>
        <input
          ivInput
          id="payments-filter"
          class="max-w-sm"
          placeholder="Filter emails…"
          [value]="table.filter.globalFilter()"
          (input)="table.filter.setFilter($any($event.target).value)"
        />
        <iv-data-table-view-options class="ml-auto" [visibility]="table.visibility" />
      </div>
      <iv-table class="rounded-lg border">
        <thead ivTableHeader>
          <tr ivTableRow>
            <th ivTableHead class="w-10">
              <iv-data-table-select-all [selection]="table.selection" />
            </th>
            @if (table.visibility.isVisible('status')) {
              <th ivTableHead>Status</th>
            }
            @if (table.visibility.isVisible('email')) {
              <th ivDataTableSort="email" [sort]="table.sort">Email</th>
            }
            @if (table.visibility.isVisible('amount')) {
              <th ivDataTableSort="amount" [sort]="table.sort" class="text-right">Amount</th>
            }
          </tr>
        </thead>
        <tbody
          ivDataTableBody
          [rows]="table.rows()"
          [colspan]="table.visibility.columns().length + 1"
        >
          @for (p of table.rows(); track p.id) {
            <tr ivTableRow [ivDataTableRow]="p.id" [selection]="table.selection">
              <td ivTableCell>
                <iv-data-table-row-select
                  [selection]="table.selection"
                  [rowId]="p.id"
                  [aria-label]="'Select ' + p.email"
                />
              </td>
              @if (table.visibility.isVisible('status')) {
                <td ivTableCell>
                  <iv-badge
                    [variant]="
                      p.status === 'failed'
                        ? 'destructive'
                        : p.status === 'pending'
                          ? 'outline'
                          : 'secondary'
                    "
                    >{{ p.status }}</iv-badge
                  >
                </td>
              }
              @if (table.visibility.isVisible('email')) {
                <td ivTableCell>{{ p.email }}</td>
              }
              @if (table.visibility.isVisible('amount')) {
                <td ivTableCell class="text-right font-medium tabular-nums">
                  {{ usd.format(p.amount) }}
                </td>
              }
            </tr>
          }
        </tbody>
      </iv-table>
      <iv-data-table-pagination [pagination]="table.pagination" [selection]="table.selection" />
    </div>
  `,
})
export default class DataTableDemo {
  protected readonly usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  protected readonly table = ivDataTable({
    data: signal(PAYMENTS),
    columns: COLUMNS,
    getRowId: (p) => p.id,
  });
}

import { ChangeDetectionStrategy, Component, computed, linkedSignal, resource } from '@angular/core';
import {
  IV_DATA_TABLE_IMPORTS,
  IvColumnDef,
  IvDataTable,
  IvDataTableQuery,
  ivDataTable,
} from '@inlaylab/ivorie/data-table';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';

interface Order {
  id: number;
  customer: string;
  total: number;
}

const COLUMNS: IvColumnDef<Order>[] = [
  { id: 'id', header: 'Order', sortable: true },
  { id: 'customer', header: 'Customer', sortable: true },
  { id: 'total', header: 'Total', sortable: true },
];

// A fake backend with 100 orders and 600 ms of latency. In an app this is your API,
// for example httpResource(() => ({ url: '/api/orders', params: … })).
const CUSTOMERS = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark', 'Wayne', 'Wonka'];
const ORDERS: Order[] = Array.from({ length: 100 }, (_, i) => ({
  id: 1001 + i,
  customer: CUSTOMERS[(i * 5) % CUSTOMERS.length],
  total: 20 + ((i * 89) % 480),
}));

interface OrderPage {
  rows: Order[];
  total: number;
}

function fetchOrders(q: IvDataTableQuery, abortSignal: AbortSignal): Promise<OrderPage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const term = q.globalFilter.trim().toLowerCase();
      let rows = ORDERS.filter(
        (o) => !term || o.customer.toLowerCase().includes(term) || String(o.id).includes(term),
      );
      const s = q.sorting;
      if (s) {
        const key = s.id as keyof Order;
        rows = [...rows].sort(
          (a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (s.desc ? -1 : 1),
        );
      }
      const { pageIndex, pageSize } = q.pagination;
      resolve({
        rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
        total: rows.length,
      });
    }, 600);
    abortSignal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(abortSignal.reason);
    });
  });
}

/** Server mode: the table keeps the state, the server filters, sorts and pages. */
@Component({
  selector: 'demo-data-table-server',
  imports: [IV_DATA_TABLE_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-full max-w-2xl flex-col gap-4">
      <label ivLabel for="orders-filter" class="sr-only">Search orders</label>
      <input
        ivInput
        id="orders-filter"
        class="max-w-xs"
        placeholder="Search customer or order…"
        (input)="table.filter.setFilter($any($event.target).value)"
      />
      <iv-table class="rounded-lg border">
        <thead ivTableHeader>
          <tr ivTableRow>
            @for (c of columns; track c.id) {
              <th [ivDataTableSort]="c.id" [sort]="table.sort">{{ c.header }}</th>
            }
          </tr>
        </thead>
        <tbody
          ivDataTableBody
          [rows]="table.rows()"
          [colspan]="3"
          [loading]="orders.isLoading()"
          [loadingRows]="table.pagination.pagination().pageSize"
        >
          @for (o of table.rows(); track o.id) {
            <tr ivTableRow>
              <td ivTableCell class="font-mono">#{{ o.id }}</td>
              <td ivTableCell>{{ o.customer }}</td>
              <td ivTableCell class="tabular-nums">{{ usd.format(o.total) }}</td>
            </tr>
          }
        </tbody>
      </iv-table>
      <iv-data-table-pagination [pagination]="table.pagination" [pageSizes]="[5, 10, 20]" />
    </div>
  `,
})
export default class DataTableServerDemo {
  protected readonly columns = COLUMNS;
  protected readonly usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  // While the next page loads, the resource has no value: keep showing the last page and total,
  // so the page count and the buttons do not jump.
  private readonly page = linkedSignal<OrderPage | undefined, OrderPage>({
    source: () => (this.orders.hasValue() ? this.orders.value() : undefined),
    computation: (next, previous) => next ?? previous?.value ?? { rows: [], total: 0 },
  });
  // The table and the resource read each other, so their types are written out.
  protected readonly table: IvDataTable<Order> = ivDataTable<Order>({
    mode: 'server',
    data: computed(() => this.page().rows),
    rowCount: computed(() => this.page().total),
    columns: COLUMNS,
    getRowId: (o) => String(o.id),
    pageSize: 5,
  });
  protected readonly orders = resource<OrderPage, IvDataTableQuery>({
    params: () => this.table.query(),
    loader: ({ params, abortSignal }) => fetchOrders(params, abortSignal),
  });
}

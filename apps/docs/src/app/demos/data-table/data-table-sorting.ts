import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_DATA_TABLE_IMPORTS, IvColumnDef, ivSort } from '@inlaylab/ivorie/data-table';

interface Release {
  version: string;
  name: string;
  date: Date;
}

const RELEASES: Release[] = [
  { version: '1.2.0', name: 'Playground', date: new Date(2026, 9, 21) },
  { version: '1.0.0', name: 'First release', date: new Date(2026, 8, 30) },
  { version: '1.10.0', name: 'Later work', date: new Date(2027, 5, 1) },
  { version: '1.1.0', name: 'More components', date: new Date(2026, 9, 9) },
];

const COLUMNS: IvColumnDef<Release>[] = [
  { id: 'version', header: 'Version', accessor: (r) => r.version, sortable: true },
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true },
  { id: 'date', header: 'Date', accessor: (r) => r.date, sortable: true },
];

/** Only sorting: ivSort on its own, no pagination or selection. Versions sort as numbers (1.10 after 1.2). */
@Component({
  selector: 'demo-data-table-sorting',
  imports: [IV_DATA_TABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-table class="w-[28rem] rounded-lg border">
      <thead ivTableHeader>
        <tr ivTableRow>
          @for (c of columns; track c.id) {
            <th [ivDataTableSort]="c.id" [sort]="sort">{{ c.header }}</th>
          }
        </tr>
      </thead>
      <tbody ivTableBody>
        @for (r of sort.rows(); track r.version) {
          <tr ivTableRow>
            <td ivTableCell class="font-mono">{{ r.version }}</td>
            <td ivTableCell>{{ r.name }}</td>
            <td ivTableCell class="tabular-nums">{{ date.format(r.date) }}</td>
          </tr>
        }
      </tbody>
    </iv-table>
  `,
})
export default class DataTableSortingDemo {
  protected readonly columns = COLUMNS;
  protected readonly date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
  protected readonly sort = ivSort(signal(RELEASES), {
    columns: COLUMNS,
    initial: { id: 'version', desc: false },
  });
}

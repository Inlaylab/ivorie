import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';

@Component({
  selector: 'demo-table-selected-rows',
  imports: [IV_TABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-table class="w-80">
      <thead ivTableHeader>
        <tr ivTableRow>
          <th ivTableHead>Name</th>
          <th ivTableHead>Role</th>
        </tr>
      </thead>
      <tbody ivTableBody>
        @for (user of users; track user.name) {
          <tr
            ivTableRow
            class="cursor-pointer"
            [attr.data-state]="selected() === user.name ? 'selected' : null"
            (click)="selected.set(user.name)"
          >
            <td ivTableCell>{{ user.name }}</td>
            <td ivTableCell>{{ user.role }}</td>
          </tr>
        }
      </tbody>
    </iv-table>
  `,
})
export default class TableSelectedRowsDemo {
  protected readonly selected = signal('Alan Turing');
  protected readonly users = [
    { name: 'Ada Lovelace', role: 'Admin' },
    { name: 'Alan Turing', role: 'Editor' },
    { name: 'Grace Hopper', role: 'Viewer' },
  ];
}

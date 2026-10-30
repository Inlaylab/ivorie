import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';

@Component({
  selector: 'demo-table',
  imports: [IV_TABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-table class="w-[28rem]">
      <thead ivTableHeader>
        <tr ivTableRow>
          <th ivTableHead>Name</th>
          <th ivTableHead>Email</th>
          <th ivTableHead>Role</th>
        </tr>
      </thead>
      <tbody ivTableBody>
        @for (user of users; track user.email) {
          <tr ivTableRow>
            <td ivTableCell>{{ user.name }}</td>
            <td ivTableCell>{{ user.email }}</td>
            <td ivTableCell>{{ user.role }}</td>
          </tr>
        }
      </tbody>
    </iv-table>
  `,
})
export default class TableDemo {
  protected readonly users = [
    { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Admin' },
    { name: 'Alan Turing', email: 'alan@example.com', role: 'Editor' },
    { name: 'Grace Hopper', email: 'grace@example.com', role: 'Viewer' },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';

@Component({
  selector: 'demo-table-in-a-card',
  imports: [IV_CARD_IMPORTS, IV_TABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-96">
      <iv-card-header class="border-b">
        <iv-card-title>Users</iv-card-title>
      </iv-card-header>
      <iv-card-content class="px-0">
        <iv-table>
          <tbody ivTableBody>
            @for (user of users; track user) {
              <tr ivTableRow>
                <td ivTableCell>{{ user }}</td>
              </tr>
            }
          </tbody>
        </iv-table>
      </iv-card-content>
    </iv-card>
  `,
})
export default class TableInACardDemo {
  protected readonly users = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'];
}

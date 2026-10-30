import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TABLE_IMPORTS } from '@ivorie/ui/table';

@Component({
  selector: 'demo-table-footer',
  imports: [IV_TABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-table class="w-80">
      <thead ivTableHeader>
        <tr ivTableRow>
          <th ivTableHead>Item</th>
          <th ivTableHead class="text-right">Total</th>
        </tr>
      </thead>
      <tbody ivTableBody>
        <tr ivTableRow>
          <td ivTableCell>Subscription</td>
          <td ivTableCell class="text-right">$25.00</td>
        </tr>
        <tr ivTableRow>
          <td ivTableCell>Support</td>
          <td ivTableCell class="text-right">$10.00</td>
        </tr>
      </tbody>
      <tfoot ivTableFooter>
        <tr ivTableRow>
          <td ivTableCell>Total</td>
          <td ivTableCell class="text-right">$35.00</td>
        </tr>
      </tfoot>
    </iv-table>
  `,
})
export default class TableFooterDemo {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';

@Component({
  selector: 'demo-table-caption',
  imports: [IV_TABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-table class="w-80">
      <caption ivTableCaption>A list of recent invoices.</caption>
      <thead ivTableHeader>
        <tr ivTableRow>
          <th ivTableHead>Invoice</th>
          <th ivTableHead>Status</th>
        </tr>
      </thead>
      <tbody ivTableBody>
        <tr ivTableRow>
          <td ivTableCell>INV001</td>
          <td ivTableCell>Paid</td>
        </tr>
        <tr ivTableRow>
          <td ivTableCell>INV002</td>
          <td ivTableCell>Pending</td>
        </tr>
      </tbody>
    </iv-table>
  `,
})
export default class TableCaptionDemo {}

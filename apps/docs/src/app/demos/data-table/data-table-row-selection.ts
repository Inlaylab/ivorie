import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DATA_TABLE_IMPORTS, ivRowSelection } from '@inlaylab/ivorie/data-table';

interface Invite {
  email: string;
  sent: string;
}

/** Only selection: ivRowSelection on its own, with a bulk action. */
@Component({
  selector: 'demo-data-table-row-selection',
  imports: [IV_DATA_TABLE_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-[28rem] flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-muted-foreground text-sm">{{ invites().length }} pending invites</span>
        <button ivButton variant="destructive" size="sm" [disabled]="!count()" (click)="revoke()">
          {{ count() ? 'Revoke ' + count() : 'Revoke' }}
        </button>
      </div>
      <iv-table class="rounded-lg border">
        <thead ivTableHeader>
          <tr ivTableRow>
            <th ivTableHead class="w-10"><iv-data-table-select-all [selection]="selection" /></th>
            <th ivTableHead>Email</th>
            <th ivTableHead>Sent</th>
          </tr>
        </thead>
        <tbody ivDataTableBody [rows]="invites()" [colspan]="3">
          @for (i of invites(); track i.email) {
            <tr ivTableRow [ivDataTableRow]="i.email" [selection]="selection">
              <td ivTableCell>
                <iv-data-table-row-select
                  [selection]="selection"
                  [rowId]="i.email"
                  [aria-label]="'Select ' + i.email"
                />
              </td>
              <td ivTableCell>{{ i.email }}</td>
              <td ivTableCell class="text-muted-foreground">{{ i.sent }}</td>
            </tr>
          }
          <span ivDataTableEmpty>No pending invites.</span>
        </tbody>
      </iv-table>
    </div>
  `,
})
export default class DataTableRowSelectionDemo {
  protected readonly invites = signal<Invite[]>([
    { email: 'ada@example.com', sent: '2 days ago' },
    { email: 'alan@example.com', sent: '5 days ago' },
    { email: 'grace@example.com', sent: '1 week ago' },
    { email: 'linus@example.com', sent: '3 weeks ago' },
  ]);
  protected readonly selection = ivRowSelection(this.invites, { getRowId: (i) => i.email });
  protected readonly count = computed(
    () => this.invites().filter((i) => this.selection.isSelected(i.email)).length,
  );

  protected revoke(): void {
    this.invites.update((all) => all.filter((i) => !this.selection.isSelected(i.email)));
    this.selection.clear();
  }
}

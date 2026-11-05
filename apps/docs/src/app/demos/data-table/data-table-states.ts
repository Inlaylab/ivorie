import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DATA_TABLE_IMPORTS } from '@inlaylab/ivorie/data-table';

/** Loading and empty states of the table body, with custom empty content. */
@Component({
  selector: 'demo-data-table-states',
  imports: [IV_DATA_TABLE_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-[28rem] flex-col gap-3">
      <div class="flex gap-2">
        <button
          ivButton
          size="sm"
          [variant]="loading() ? 'default' : 'outline'"
          [attr.aria-pressed]="loading()"
          (click)="loading.set(true)"
        >
          Loading
        </button>
        <button
          ivButton
          size="sm"
          [variant]="loading() ? 'outline' : 'default'"
          [attr.aria-pressed]="!loading()"
          (click)="loading.set(false)"
        >
          Empty
        </button>
      </div>
      <iv-table class="rounded-lg border">
        <thead ivTableHeader>
          <tr ivTableRow>
            <th ivTableHead>Project</th>
            <th ivTableHead>Owner</th>
            <th ivTableHead>Updated</th>
          </tr>
        </thead>
        <tbody ivDataTableBody [rows]="[]" [colspan]="3" [loading]="loading()" [loadingRows]="4">
          <div ivDataTableEmpty class="flex flex-col items-center gap-1 py-4">
            <span class="text-foreground font-medium">No projects yet</span>
            <span>Projects you create show up here.</span>
          </div>
        </tbody>
      </iv-table>
    </div>
  `,
})
export default class DataTableStatesDemo {
  protected readonly loading = signal(true);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';

@Component({
  selector: 'demo-sheet-side',
  imports: [IV_SHEET_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-2 gap-2">
      @for (side of sides; track side) {
        <button ivButton variant="outline" class="capitalize" [ivSheetTrigger]="sheet" [ivSheetConfig]="{ side }">{{ side }}</button>
      }
    </div>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Notifications</iv-sheet-title>
        <iv-sheet-description>You have no new notifications.</iv-sheet-description>
      </iv-sheet-header>
    </ng-template>
  `,
})
export default class SheetSideDemo {
  protected readonly sides = ['top', 'right', 'bottom', 'left'] as const;
}

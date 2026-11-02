import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';

@Component({
  selector: 'demo-sheet',
  imports: [IV_SHEET_IMPORTS, IV_INPUT_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="outline" [ivSheetTrigger]="sheet">Open</button>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Edit profile</iv-sheet-title>
        <iv-sheet-description>Make changes to your profile here. Click save when you're done.</iv-sheet-description>
      </iv-sheet-header>
      <div class="grid gap-4 px-6">
        <div class="grid gap-2">
          <label ivLabel for="sheet-name">Name</label>
          <input ivInput id="sheet-name" value="Ada Lovelace" />
        </div>
        <div class="grid gap-2">
          <label ivLabel for="sheet-user">Username</label>
          <input ivInput id="sheet-user" value="@ada" />
        </div>
      </div>
      <iv-sheet-footer>
        <button ivButton ivSheetClose="saved">Save changes</button>
        <button ivButton variant="outline" ivSheetClose>Cancel</button>
      </iv-sheet-footer>
    </ng-template>
  `,
})
export default class SheetDemo {}

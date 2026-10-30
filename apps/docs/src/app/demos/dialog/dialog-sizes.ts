import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { DialogSize, IV_DIALOG_IMPORTS, IvDialog } from '@inlaylab/ivorie/dialog';

@Component({
  selector: 'demo-dialog-sizes',
  imports: [IV_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-2">
      @for (size of sizes; track size) {
        <button ivButton variant="outline" (click)="open(size)">{{ size }}</button>
      }
    </div>

    <ng-template #tpl>
      <iv-dialog-header>
        <iv-dialog-title>Dialog size</iv-dialog-title>
        <iv-dialog-description>Set the width with the size option.</iv-dialog-description>
      </iv-dialog-header>
      <iv-dialog-footer>
        <button ivButton ivDialogClose>Close</button>
      </iv-dialog-footer>
    </ng-template>
  `,
})
export default class DialogSizesDemo {
  private readonly dialog = inject(IvDialog);
  private readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
  protected readonly sizes: DialogSize[] = ['sm', 'default', 'lg', 'xl'];

  open(size: DialogSize) {
    this.dialog.open(this.tpl(), { size });
  }
}

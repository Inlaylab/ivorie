import { ChangeDetectionStrategy, Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IV_DIALOG_IMPORTS, IvDialog } from '@ivorie/ui/dialog';

@Component({
  selector: 'demo-dialog',
  imports: [IV_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="outline" (click)="open()">Open dialog</button>
    @if (deleted()) {
      <p class="mt-2 text-sm text-muted-foreground">Project deleted.</p>
    }

    <ng-template #confirmTpl>
      <iv-dialog-header>
        <iv-dialog-title>Delete project?</iv-dialog-title>
        <iv-dialog-description>This action cannot be undone.</iv-dialog-description>
      </iv-dialog-header>
      <iv-dialog-footer>
        <button ivButton variant="outline" [ivDialogClose]="false">Cancel</button>
        <button ivButton variant="destructive" [ivDialogClose]="true">Delete</button>
      </iv-dialog-footer>
    </ng-template>
  `,
})
export default class DialogDemo {
  private readonly dialog = inject(IvDialog);
  private readonly confirmTpl = viewChild.required<TemplateRef<unknown>>('confirmTpl');
  protected readonly deleted = signal(false);

  open() {
    this.dialog
      .open<unknown, boolean>(this.confirmTpl())
      .afterClosed()
      .subscribe(({ result }) => this.deleted.set(result === true));
  }
}

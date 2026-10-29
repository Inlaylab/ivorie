import { ChangeDetectionStrategy, Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IV_ALERT_DIALOG_IMPORTS, IvAlertDialog } from '@ivorie/ui/alert-dialog';

@Component({
  selector: 'demo-alert-dialog-service',
  imports: [IV_ALERT_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" (click)="remove()">Remove user</button>
      @if (removed()) {
        <p class="text-sm text-muted-foreground">User removed.</p>
      }
    </div>

    <ng-template #confirmTpl>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Remove user?</iv-alert-dialog-title>
        <iv-alert-dialog-description>They lose access right away.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Cancel</button>
        <button ivAlertDialogAction variant="destructive">Remove</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export default class AlertDialogServiceDemo {
  private readonly alertDialog = inject(IvAlertDialog);
  private readonly confirmTpl = viewChild.required<TemplateRef<unknown>>('confirmTpl');
  protected readonly removed = signal(false);

  remove() {
    this.alertDialog
      .open(this.confirmTpl())
      .afterClosed()
      .subscribe(({ reason }) => this.removed.set(reason === 'action'));
  }
}

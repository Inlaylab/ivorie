import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { AlertDialogCloseEvent, IV_ALERT_DIALOG_IMPORTS } from '@ivorie/ui/alert-dialog';

@Component({
  selector: 'demo-alert-dialog-result',
  imports: [IV_ALERT_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" [ivAlertDialogTrigger]="tpl" (closed)="onClosed($event)">
        Archive project
      </button>
      @if (archivedId()) {
        <p class="text-sm text-muted-foreground">Archived project {{ archivedId() }}</p>
      }
    </div>

    <ng-template #tpl>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Archive project 42?</iv-alert-dialog-title>
        <iv-alert-dialog-description>You can restore it later.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Cancel</button>
        <button [ivAlertDialogAction]="42">Archive</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export default class AlertDialogResultDemo {
  protected readonly archivedId = signal<number | null>(null);

  onClosed({ reason, result }: AlertDialogCloseEvent) {
    if (reason === 'action') this.archivedId.set(result as number);
  }
}

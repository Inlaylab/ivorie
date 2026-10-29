import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { AlertDialogCloseEvent, IV_ALERT_DIALOG_IMPORTS } from '@ivorie/ui/alert-dialog';

@Component({
  selector: 'demo-alert-dialog',
  imports: [IV_ALERT_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" [ivAlertDialogTrigger]="confirmTpl" (closed)="last.set($event)">
        Delete account
      </button>
      <p class="text-sm text-muted-foreground">Last close: {{ last()?.reason ?? 'none' }}</p>
    </div>

    <ng-template #confirmTpl>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Delete account?</iv-alert-dialog-title>
        <iv-alert-dialog-description>
          This action cannot be undone. All your data will be permanently removed.
        </iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Cancel</button>
        <button ivAlertDialogAction variant="destructive">Delete</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export default class AlertDialogDemo {
  protected readonly last = signal<AlertDialogCloseEvent | null>(null);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideTrash2 } from '@lucide/angular';
import { IvButton } from '@ivorie/ui/button';
import { IV_ALERT_DIALOG_IMPORTS } from '@ivorie/ui/alert-dialog';

@Component({
  selector: 'demo-alert-dialog-media',
  imports: [IV_ALERT_DIALOG_IMPORTS, IvButton, LucideTrash2],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="outline" [ivAlertDialogTrigger]="tpl">Delete account</button>

    <ng-template #tpl>
      <iv-alert-dialog-header>
        <iv-alert-dialog-media>
          <svg lucideTrash2></svg>
        </iv-alert-dialog-media>
        <iv-alert-dialog-title>Delete account?</iv-alert-dialog-title>
        <iv-alert-dialog-description>This cannot be undone.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Cancel</button>
        <button ivAlertDialogAction variant="destructive">Delete</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export default class AlertDialogMediaDemo {}

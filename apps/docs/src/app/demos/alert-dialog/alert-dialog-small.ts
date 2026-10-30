import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_ALERT_DIALOG_IMPORTS } from '@inlaylab/ivorie/alert-dialog';

@Component({
  selector: 'demo-alert-dialog-small',
  imports: [IV_ALERT_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="outline" [ivAlertDialogTrigger]="tpl" [ivAlertDialogConfig]="{ size: 'sm' }">
      Sign out
    </button>

    <ng-template #tpl>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Sign out?</iv-alert-dialog-title>
        <iv-alert-dialog-description>You will need to sign in again.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Stay</button>
        <button ivAlertDialogAction>Sign out</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export default class AlertDialogSmallDemo {}

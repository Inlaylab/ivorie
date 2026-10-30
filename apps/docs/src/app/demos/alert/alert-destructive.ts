import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ALERT_IMPORTS } from '@ivorie/ui/alert';

@Component({
  selector: 'demo-alert-destructive',
  imports: [IV_ALERT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-alert variant="destructive" class="w-full max-w-md">
      <iv-alert-title>Session expired</iv-alert-title>
      <iv-alert-description>Please sign in again to continue.</iv-alert-description>
    </iv-alert>
  `,
})
export default class AlertDestructiveDemo {}

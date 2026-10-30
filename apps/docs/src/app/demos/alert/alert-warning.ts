import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert';

@Component({
  selector: 'demo-alert-warning',
  imports: [IV_ALERT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-alert variant="warning" class="w-full max-w-md">
      <iv-alert-title>Approaching limit</iv-alert-title>
      <iv-alert-description>You have used 90% of your monthly quota.</iv-alert-description>
    </iv-alert>
  `,
})
export default class AlertWarningDemo {}

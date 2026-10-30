import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert';

@Component({
  selector: 'demo-alert',
  imports: [IV_ALERT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-alert class="w-full max-w-md">
      <iv-alert-title>Heads up</iv-alert-title>
      <iv-alert-description>You can change your display name in settings.</iv-alert-description>
    </iv-alert>
  `,
})
export default class AlertDemo {}

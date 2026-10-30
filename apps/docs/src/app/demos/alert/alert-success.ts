import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert';

@Component({
  selector: 'demo-alert-success',
  imports: [IV_ALERT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-alert variant="success" class="w-full max-w-md">
      <iv-alert-title>Changes saved</iv-alert-title>
      <iv-alert-description>Your profile has been updated.</iv-alert-description>
    </iv-alert>
  `,
})
export default class AlertSuccessDemo {}

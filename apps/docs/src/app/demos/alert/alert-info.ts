import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ALERT_IMPORTS } from '@ivorie/ui/alert';

@Component({
  selector: 'demo-alert-info',
  imports: [IV_ALERT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-alert variant="info" class="w-full max-w-md">
      <iv-alert-title>Maintenance window</iv-alert-title>
      <iv-alert-description>Scheduled downtime on Sunday, 2 AM to 4 AM UTC.</iv-alert-description>
    </iv-alert>
  `,
})
export default class AlertInfoDemo {}

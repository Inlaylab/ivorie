import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ALERT_IMPORTS } from '@ivorie/ui/alert';
import { LucideCircleAlert } from '@lucide/angular';

@Component({
  selector: 'demo-alert-icon',
  imports: [IV_ALERT_IMPORTS, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-alert variant="destructive" class="w-full max-w-md">
      <svg lucideCircleAlert></svg>
      <iv-alert-title>Error</iv-alert-title>
      <iv-alert-description>Your session has expired.</iv-alert-description>
    </iv-alert>
  `,
})
export default class AlertIconDemo {}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_ALERT_IMPORTS } from '@ivorie/ui/alert';
import { IvButton } from '@ivorie/ui/button';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'demo-alert-action',
  imports: [IV_ALERT_IMPORTS, IvButton, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <iv-alert class="w-full max-w-md">
        <iv-alert-title>Update available</iv-alert-title>
        <iv-alert-description>A new version is ready to install.</iv-alert-description>
        <iv-alert-action>
          <button ivButton size="icon-xs" variant="ghost" aria-label="Dismiss" (click)="open.set(false)">
            <svg lucideX></svg>
          </button>
        </iv-alert-action>
      </iv-alert>
    }
  `,
})
export default class AlertActionDemo {
  protected readonly open = signal(true);
}

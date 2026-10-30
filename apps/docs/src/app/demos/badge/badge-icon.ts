import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvBadge } from '@ivorie/ui/badge';
import { LucideCheck } from '@lucide/angular';

@Component({
  selector: 'demo-badge-icon',
  imports: [IvBadge, LucideCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-badge variant="secondary">
      <svg lucideCheck></svg>
      Verified
    </iv-badge>
  `,
})
export default class BadgeIconDemo {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';

@Component({
  selector: 'demo-badge-card-action',
  imports: [IvBadge, IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <iv-card-header>
        <iv-card-title>Build</iv-card-title>
        <iv-card-description>Last run on main.</iv-card-description>
        <iv-card-action>
          <iv-badge variant="destructive">3 errors</iv-badge>
        </iv-card-action>
      </iv-card-header>
    </iv-card>
  `,
})
export default class BadgeCardActionDemo {}

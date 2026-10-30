import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IvButton } from '@inlaylab/ivorie/button';
import { LucideEllipsis } from '@lucide/angular';

@Component({
  selector: 'demo-card-header-divider',
  imports: [IV_CARD_IMPORTS, IvButton, LucideEllipsis],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <iv-card-header class="border-b">
        <iv-card-title>Users</iv-card-title>
        <iv-card-action>
          <button ivButton size="icon-sm" variant="ghost" aria-label="More">
            <svg lucideEllipsis></svg>
          </button>
        </iv-card-action>
      </iv-card-header>
      <iv-card-content>
        <p class="text-sm">Table goes here.</p>
      </iv-card-content>
    </iv-card>
  `,
})
export default class CardHeaderDividerDemo {}

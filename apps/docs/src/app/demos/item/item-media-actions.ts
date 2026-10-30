import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ITEM_IMPORTS } from '@ivorie/ui/item';
import { IvButton } from '@ivorie/ui/button';
import { LucideUser } from '@lucide/angular';
import { LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'demo-item-media-actions',
  imports: [IV_ITEM_IMPORTS, IvButton, LucideUser, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-item-group class="w-full max-w-sm">
      <iv-item variant="outline">
        <iv-item-media variant="icon">
          <svg lucideUser></svg>
        </iv-item-media>
        <iv-item-content>
          <iv-item-title>Profile</iv-item-title>
          <p ivItemDescription>Manage your account details.</p>
        </iv-item-content>
        <iv-item-actions>
          <button ivButton variant="ghost" size="icon-sm" aria-label="Open profile">
            <svg lucideChevronRight></svg>
          </button>
        </iv-item-actions>
      </iv-item>
    </iv-item-group>
  `,
})
export default class ItemMediaActionsDemo {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ITEM_IMPORTS } from '@inlaylab/ivorie/item';

@Component({
  selector: 'demo-item',
  imports: [IV_ITEM_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-item-group class="w-full max-w-sm">
      <iv-item variant="outline">
        <iv-item-content>
          <iv-item-title>Profile</iv-item-title>
          <p ivItemDescription>Manage your account details.</p>
        </iv-item-content>
      </iv-item>
    </iv-item-group>
  `,
})
export default class ItemDemo {}

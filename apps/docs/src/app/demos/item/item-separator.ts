import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ITEM_IMPORTS } from '@ivorie/ui/item';

@Component({
  selector: 'demo-item-separator',
  imports: [IV_ITEM_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-item-group class="w-full max-w-sm">
      <iv-item>
        <iv-item-content><iv-item-title>Account</iv-item-title></iv-item-content>
      </iv-item>
      <iv-item-separator />
      <iv-item>
        <iv-item-content><iv-item-title>Billing</iv-item-title></iv-item-content>
      </iv-item>
    </iv-item-group>
  `,
})
export default class ItemSeparatorDemo {}

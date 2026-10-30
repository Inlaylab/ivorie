import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ITEM_IMPORTS } from '@inlaylab/ivorie/item';

@Component({
  selector: 'demo-item-sizes',
  imports: [IV_ITEM_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-item-group class="w-full max-w-sm gap-2">
      <iv-item variant="outline">
        <iv-item-content><iv-item-title>Default</iv-item-title></iv-item-content>
      </iv-item>
      <iv-item variant="muted" size="sm">
        <iv-item-content><iv-item-title>Small</iv-item-title></iv-item-content>
      </iv-item>
      <iv-item variant="outline" size="xs">
        <iv-item-content><iv-item-title>Extra small</iv-item-title></iv-item-content>
      </iv-item>
    </iv-item-group>
  `,
})
export default class ItemSizesDemo {}

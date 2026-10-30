import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ITEM_IMPORTS } from '@ivorie/ui/item';

@Component({
  selector: 'demo-item-header-footer',
  imports: [IV_ITEM_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-item variant="outline" class="w-full max-w-sm">
      <iv-item-header>
        <iv-item-title>Invoice 1042</iv-item-title>
        <span class="text-sm text-muted-foreground">Paid</span>
      </iv-item-header>
      <iv-item-content>
        <p ivItemDescription>Monthly plan, billed on the 15th.</p>
      </iv-item-content>
      <iv-item-footer>
        <span class="text-sm text-muted-foreground">Jan 15</span>
        <span class="text-sm font-medium">$24.00</span>
      </iv-item-footer>
    </iv-item>
  `,
})
export default class ItemHeaderFooterDemo {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_SCROLL_AREA_IMPORTS } from '@inlaylab/ivorie/scroll-area';

@Component({
  selector: 'demo-scroll-area',
  imports: [IV_SCROLL_AREA_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-scroll-area maxHeight="240px" class="w-64 rounded-md border">
      @for (item of items; track item) {
        <div class="border-b px-3 py-2 text-sm last:border-b-0">{{ item }}</div>
      }
    </iv-scroll-area>
  `,
})
export default class ScrollAreaDemo {
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_SCROLL_AREA_IMPORTS } from '@ivorie/ui/scroll-area';

@Component({
  selector: 'demo-scroll-area-fill-parent',
  imports: [IV_SCROLL_AREA_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-56 w-64">
      <iv-scroll-area class="h-full rounded-md border">
        @for (item of items; track item) {
          <div class="px-3 py-2 text-sm">{{ item }}</div>
        }
      </iv-scroll-area>
    </div>
  `,
})
export default class ScrollAreaFillParentDemo {
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);
}

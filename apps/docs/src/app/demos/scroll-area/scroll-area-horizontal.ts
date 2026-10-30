import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_SCROLL_AREA_IMPORTS } from '@inlaylab/ivorie/scroll-area';

@Component({
  selector: 'demo-scroll-area-horizontal',
  imports: [IV_SCROLL_AREA_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-scroll-area type="scroll-x" class="w-80 rounded-md border">
      <div class="flex w-max gap-3 p-3">
        @for (col of columns; track col) {
          <div class="flex h-20 w-32 shrink-0 items-center justify-center rounded-md bg-muted text-sm">{{ col }}</div>
        }
      </div>
    </iv-scroll-area>
  `,
})
export default class ScrollAreaHorizontalDemo {
  protected readonly columns = Array.from({ length: 12 }, (_, i) => `Card ${i + 1}`);
}

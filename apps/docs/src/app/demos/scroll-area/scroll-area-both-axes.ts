import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_SCROLL_AREA_IMPORTS } from '@inlaylab/ivorie/scroll-area';

@Component({
  selector: 'demo-scroll-area-both-axes',
  imports: [IV_SCROLL_AREA_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-scroll-area type="always" maxHeight="200px" maxWidth="320px" class="rounded-md border">
      <div class="grid w-[640px] grid-cols-4 gap-2 p-3 text-sm">
        @for (cell of cells; track cell) {
          <div class="rounded-md bg-muted p-3">{{ cell }}</div>
        }
      </div>
    </iv-scroll-area>
  `,
})
export default class ScrollAreaBothAxesDemo {
  protected readonly cells = Array.from({ length: 24 }, (_, i) => `Cell ${i + 1}`);
}

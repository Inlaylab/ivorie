import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvAspectRatio } from '@inlaylab/ivorie/aspect-ratio';

@Component({
  selector: 'demo-aspect-ratio-square',
  imports: [IvAspectRatio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-aspect-ratio ratio="1" class="bg-muted w-48 rounded-lg">
      <div class="text-muted-foreground flex size-full items-center justify-center text-sm">1 / 1</div>
    </iv-aspect-ratio>
  `,
})
export default class AspectRatioSquareDemo {}

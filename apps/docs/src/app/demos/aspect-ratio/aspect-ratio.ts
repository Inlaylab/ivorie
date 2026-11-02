import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvAspectRatio } from '@inlaylab/ivorie/aspect-ratio';

@Component({
  selector: 'demo-aspect-ratio',
  imports: [IvAspectRatio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-aspect-ratio [ratio]="16 / 9" class="bg-muted w-full max-w-sm overflow-hidden rounded-lg">
      <div class="from-primary/20 to-primary/60 text-primary-foreground flex size-full items-center justify-center bg-linear-to-br text-sm font-medium">
        16 / 9
      </div>
    </iv-aspect-ratio>
  `,
})
export default class AspectRatioDemo {}

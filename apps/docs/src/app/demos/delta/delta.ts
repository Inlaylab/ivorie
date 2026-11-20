import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvDelta } from '@inlaylab/ivorie/delta';

@Component({
  selector: 'demo-delta',
  imports: [IvDelta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <iv-delta [value]="12" />
      <iv-delta [value]="-3.5" />
      <iv-delta [value]="0" />
      <iv-delta [value]="1250" format="number" />
    </div>
  `,
})
export default class DeltaDemo {}

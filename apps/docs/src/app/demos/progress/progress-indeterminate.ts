import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvProgress } from '@inlaylab/ivorie/progress';

@Component({
  selector: 'demo-progress-indeterminate',
  imports: [IvProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-sm gap-2">
      <div class="flex items-baseline justify-between gap-4 text-sm">
        <span class="font-medium" id="export-label">Preparing your export</span>
        <span class="text-muted-foreground">Size unknown</span>
      </div>
      <iv-progress [value]="null" aria-labelledby="export-label" />
    </div>
  `,
})
export default class ProgressIndeterminateDemo {}
